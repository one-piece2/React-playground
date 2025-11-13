import { useContext, useEffect, useState } from "react";
import { PlaygroundContext } from "../../../PlaygroundContext";
import styles from "./FileNameItem/index.module.scss";
import { FileNameItem } from "./FileNameItem";
import { APP_COMPONENT_FILE_NAME, ENTRY_FILE_NAME, IMPORT_MAP_FILE_NAME } from "../../../files";
export default function FileNameList() {
  const {
    files,
    removeFile,
    addFile,
    updateFileName,
    selectedFileName,
    setSelectedFileName,
  } = useContext(PlaygroundContext);
const readonlyFileNames = [ENTRY_FILE_NAME, IMPORT_MAP_FILE_NAME, APP_COMPONENT_FILE_NAME];
  const [tabs, setTabs] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    setTabs(Object.keys(files));
  }, [files]);
  const handleEditComplete = (name: string, prevName: string) => {
    updateFileName(prevName, name);
    setSelectedFileName(name);
    setCreating(false);
  };
  const addTab = () => {
    const newFileName = "Comp" + Math.random().toString().slice(2, 8) + ".tsx";
    addFile(newFileName);
    setSelectedFileName(newFileName);
    setCreating(true);
  };
  const handleRemove = (name: string) => {
   
    setSelectedFileName(ENTRY_FILE_NAME)
     removeFile(name)
}
  return (
    <div className={styles.tabs}>
      {tabs.map((item, index) => (
        <FileNameItem
        readonly={readonlyFileNames.includes(item)}
          creating={creating && index === tabs.length - 1}
          key={index + item}
          actived={item === selectedFileName}
          onClick={() => setSelectedFileName(item)}
          value={item}
          onEditComplete={(name: string) => handleEditComplete(name, item)}
          onRemove={() => {
           
            handleRemove(item);
          }}
        />
      ))}
      <div className={styles.add} onClick={addTab}>
        +
      </div>
    </div>
  );
}
