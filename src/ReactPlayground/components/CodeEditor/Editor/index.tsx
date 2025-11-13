//这是一个代码编辑器组件，使用了Monaco Editor来实现代码编辑功能
import MonacoEditor, {
  type OnMount,
  type EditorProps,
} from "@monaco-editor/react";
import { createATA } from "./ata";
import { editor } from "monaco-editor";
import { useEffect, useRef } from "react";
export interface EditorFile {
  name: string;
  value: string;
  language: string;
}
interface Props {
  file: EditorFile;
  onChange?: EditorProps["onChange"];
  options?: editor.IStandaloneEditorConstructionOptions;
}
export default function Editor(Props: Props) {
  const { file, onChange, options } = Props;
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  // monaco 类型复杂，这里使用 any 并忽略 lint
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monacoRef = useRef<any | null>(null)
  const ataRef = useRef<((code: string) => void) | null>(null)
  //     const code = `export default function App() {
  //     return <div>xxx</div>
  // }
  //     `;

  // 编辑器挂载后的回调函数，配置TypeScript的编译选项
  const handleEditorMount: OnMount = (editor, monaco) => {
    // 注册一个快捷键 Ctrl+Q 来格式化文档
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyQ, () => {
      editor.getAction("editor.action.formatDocument")?.run();
    });
    // 保存 editor 与 monaco 到 ref（供文件切换时使用）
    editorRef.current = editor
    monacoRef.current = monaco

    // 初始化 ATA（自动类型获取） 传入一个回调函数，当下载到类型定义文件时调用
    ataRef.current = createATA((code, path) => {
      // 将下载到的类型定义文件添加到 Monaco Editor 的 TypeScript 语言服务中
      monacoRef.current?.languages.typescript.typescriptDefaults.addExtraLib(
        code,
        `file://${path}`
      );
    });
    //就是最开始获取一次类型，然后内容改变之后获取一次类型，获取类型之后用 addExtraLib 添加到 ts 里
    editor.onDidChangeModelContent(() => {
      ataRef.current?.(editor.getValue())
    })

    // 初始调用一次 ATA
    ataRef.current?.(editor.getValue())
    // 设置 TypeScript 的编译选项
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      //Preserve 表示保留 JSX 语法不被编译（适合 React 项目，由 Babel 等工具后续处理）。
      jsx: monaco.languages.typescript.JsxEmit.Preserve,
      //允许 CommonJS 模块和 ES 模块之间的互操作（避免导入非 ES 模块时的语法错误）。
      esModuleInterop: true,
    });
  };

  // 当传入的 file 改变时（切换文件），同步编辑器内容并触发 ATA
  useEffect(() => {
    
    if (editorRef.current) {
      const current = editorRef.current.getValue()
      if (current !== file.value) editorRef.current.setValue(file.value)
    }
    // 触发 ata 去检查并下载类型声明
    ataRef.current?.(file.value)
  }, [file?.name, file?.value])
  return (
    <MonacoEditor
      height="100%"
      path={file.name}
      onChange={onChange}
      language={file.language}
      value={file.value}
      onMount={handleEditorMount}
      options={{
        fontSize: 18,
        scrollBeyondLastLine: false,
        minimap: {
          enabled: false,
        },
        scrollbar: {
          verticalScrollbarSize: 6,
          horizontalScrollbarSize: 6,
        },
        ...options,
      }}
    />
  );
}
