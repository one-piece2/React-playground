import { useContext } from "react";
import Editor from "./Editor";
import FileNameList from "./FileNameList";
import { PlaygroundContext } from "../../PlaygroundContext";
import { type File } from "../../types";
import { debounce } from "lodash-es";


export default function CodeEditor() {
  // const file = {
  //       name: 'guang.tsx',
  //       value: 'const a = <div>guang</div>',
  //       language: 'typescript'
  //   }

  
const { 
    files, 
    setFiles, 
    selectedFileName, 
  
    theme
} = useContext(PlaygroundContext)


const file:File = files[selectedFileName];

  function onEditorChange(value?: string) {
       files[file.name].value=value || ''
       setFiles({ ...files })
    }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <FileNameList/>
        {/* 编辑是一个频繁的事件，加一个防抖 */}
         <Editor file={file} onChange={debounce(onEditorChange,500)} options={{ theme:`vs-${theme}` }}/>
    </div>
  )
}