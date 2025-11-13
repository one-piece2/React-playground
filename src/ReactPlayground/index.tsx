import { Allotment } from "allotment";
import 'allotment/dist/style.css';
import Header from './components/Header';
import CodeEditor from "./components/CodeEditor";
import Preview from "./components/Preview";

export default function ReactPlayground() {
    return <div style={{height: '100vh'}}>
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