import { transform } from "@babel/standalone";
import { type Files,type File } from "../../types";
import { ENTRY_FILE_NAME } from "../../files";
import type { PluginObj } from "@babel/core";

const getModuleFile = (files: Files, modulePath: string) => {
    
  let moduleName = modulePath.split("./").pop() || "";
  // 处理没有后缀名的模块导入情况，比如 import './App'
  if (!moduleName.includes(".")) {
    const realModuleName = Object.keys(files)
      .filter((key) => {
        return (
          key.endsWith(".ts") ||
          key.endsWith(".tsx") ||
          key.endsWith(".js") ||
          key.endsWith(".jsx")
        );
      })
      .find((key) => {
        return key.split(".").includes(moduleName);
      });
    if (realModuleName) {
      moduleName = realModuleName;
    }
  }
  // 根据模块名称返回对应的文件内容
  return files[moduleName];
};
const json2Js = (file: File) => {
    const js = `export default ${file.value}`
    return URL.createObjectURL(new Blob([js], { type: 'application/javascript' }))
}
const css2Js = (file: File) => {
    const randomId = new Date().getTime()
    //处理css不用默认导出，而是动态创建style标签的方式将样式注入到页面中，并且是立即执行函数，这样直接import './x.css' 就能执行生效
    //import a from './x' 这种情况，模块内部必须有export语句，否则会报错，所以这里不需要export 直接执行即可
    const js = `
(() => {
    const stylesheet = document.createElement('style')
    stylesheet.setAttribute('id', 'style_${randomId}_${file.name}')
    document.head.appendChild(stylesheet)

    const styles = document.createTextNode(\`${file.value}\`)
    stylesheet.innerHTML = ''
    stylesheet.appendChild(styles)
})()
    `
    return URL.createObjectURL(new Blob([js], { type: 'application/javascript' }))
}
// 在转换代码前，检查是否需要自动引入 React
export const beforeTransformCode = (filename: string, code: string) => {
    let _code = code
    const regexReact = /import\s+React/g
    if ((filename.endsWith('.jsx') || filename.endsWith('.tsx')) && !regexReact.test(code)) {
      _code = `import React from 'react';\n${code}`
    }
    return _code
}
// 自定义 Babel 插件，用于解析模块路径并替换为实际代码
function customResolver(files: Files): PluginObj {
  return {
    visitor: {
      ImportDeclaration(path) {
        const modulePath = path.node.source.value;
        //处理相对路径的导入
        if (modulePath.startsWith(".")) {
            //getMiduleFile：根据模块路径获取对应的文件内容 如果是./App这种得话 还会帮忙补全后缀
          const file = getModuleFile(files, modulePath);
          if (!file) {
            return;
          }
          if (file.name.endsWith(".css")) {
            path.node.source.value = css2Js(file);
          } else if (file.name.endsWith(".json")) {
            path.node.source.value = json2Js(file);
          } else {
            
            path.node.source.value = URL.createObjectURL(
              new Blob([babelTransform(file.name, file.value, files)], {
                type: "application/javascript",
              })
            );
          }
        }
      },
    },
  };
}
export const babelTransform = (
  filename: string,
  code: string,
  files: Files
) => {
    code = beforeTransformCode(filename, code)
  let result = "";
  try {
    result = transform(code, {
      presets: ["react", "typescript"],
      filename,
      plugins: [customResolver(files)],
      //编译选项，编译后 保持行号对应
      retainLines: true,
    }).code!;
  } catch (e) {
    console.error("编译出错", e);
  }
  return result;
};
// 编译入口文件 main.tsx
export const compile = (files: Files) => {
  const main = files[ENTRY_FILE_NAME];
  return babelTransform(ENTRY_FILE_NAME, main.value, files);
};



self.addEventListener('message', async ({data}) => {
  const { type, fi } = data;
  if(type === 'COMPILE') {
    try{
      const compiledCode =  compile(fi);
      self.postMessage({
        type: 'COMPILED_CODE',
        data: compiledCode,
      })
    }catch(e){
      self.postMessage({
        type: 'COMPILE_ERROR',
        data: e instanceof Error ? e.message : String(e),
      })
    }
    
  }
})