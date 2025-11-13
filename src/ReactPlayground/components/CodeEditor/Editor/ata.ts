import { setupTypeAcquisition } from '@typescript/ata'
import typescriprt from 'typescript';

export function createATA(onDownloadFile: (code: string, path: string) => void) {
  const ata = setupTypeAcquisition({
    projectName: 'my-ata',
    typescript: typescriprt,
    logger: console,
    delegate: {
        //传入外部代码下载外部代码需要类型时，触发这个回调
      receivedFile: (code, path) => {
        console.log('自动下载的包', path);
        //调用传入的回调函数
        onDownloadFile(code, path);
      }
    },
  })

  return ata;
}