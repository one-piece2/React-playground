import { useContext, useEffect, useRef, useState } from "react";
import { PlaygroundContext } from "../../PlaygroundContext";
import CompilerWorker from "./compiler.work?worker";
import iframeRaw from "./iframe.html?raw";
import { IMPORT_MAP_FILE_NAME } from "../../files";
import { Message } from "../Message";
import { debounce } from "lodash-es";
export default function Preview() {
  interface MessageData {
    data: {
      type: string
      message: string
    }
}
  const [err, setErr] = useState('');
  const compilerWorkerRef = useRef<Worker>(null);
  const { files } = useContext(PlaygroundContext);
  const [compiledCode, setCompiledCode] = useState("");
  const getIframeUrl = () => {
    const res = iframeRaw
      .replace(
        '<script type="importmap"></script>',
        `<script type="importmap">${files[IMPORT_MAP_FILE_NAME].value}</script>`
      )
      .replace(
        '<script type="module" id="appSrc"></script>',
        `<script type="module" id="appSrc">${compiledCode}</script>`
      );
    return URL.createObjectURL(new Blob([res], { type: "text/html" }));
  };
  const [iframeUrl, setIframeUrl] = useState(getIframeUrl());
  function handleMessage(mes:MessageData) {
    const { type, message} = mes.data;
    if(type==='ERROR') {
      setErr(message)
    }
   
  }
  //挂载错误处理事件 
  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  },[])
  

  useEffect(debounce(() => {
    setErr('')
    // const res = compile(files);
    // setCompiledCode(res);
    compilerWorkerRef.current?.postMessage({
      type: 'COMPILE',
      fi: files,
    })
  }, 500), [files]);

  useEffect(() => {
    if(!compilerWorkerRef.current) {
      compilerWorkerRef.current = new CompilerWorker();
      compilerWorkerRef.current.addEventListener('message', ({data})=>{
      console.log('hhhhhhhhhhhhhhhhhhhh')
        if(data.type==='COMPILED_CODE') {
          setCompiledCode(data.data)
        }else{
          setErr(data.data)
        }
        
      })
    } 
    
  },[])
  useEffect(() => {
    setIframeUrl(getIframeUrl());
  }, [files[IMPORT_MAP_FILE_NAME].value, compiledCode]);
  return (
    <div style={{ height: "100%" }}>
      <iframe
        src={iframeUrl}
        style={{
          width: "100%",
          height: "100%",
          padding: 0,
          border: "none",
        }}
      />
      <Message type='error' content={err} />
      {/* <Editor
        file={{
          name: "dist.js",
          value: compiledCode,
          language: "javascript",
        }}
      /> */}
    </div>
  );
}
