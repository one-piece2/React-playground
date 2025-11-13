import { Allotment } from "allotment";
import 'allotment/dist/style.css';
import Header from './components/Header';
import CodeEditor from "./components/CodeEditor";
import Preview from "./components/Preview";
import '../index.scss'
import { useContext } from "react";
import { PlaygroundContext } from "./PlaygroundContext";
export default function ReactPlayground() {
    const {theme,setTheme} = useContext(PlaygroundContext)
    return <div style={{height: '100vh'}} className={theme}>
        <Header/>
        <Allotment defaultSizes={[100, 100]}>
            <Allotment.Pane minSize={500}>
                <div style={{ height: '100%' }}>
                <CodeEditor/>
                </div>
            </Allotment.Pane>
            <Allotment.Pane minSize={0}>
                <div style={{ height: '100%' }}>
                   <Preview/>
                </div>
            </Allotment.Pane>
        </Allotment>
    </div>
}