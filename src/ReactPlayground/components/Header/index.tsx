import logoSvg from '../icons/logo.svg'
import styles from '../index.module.scss'
//切换主题按钮
import { MoonOutlined, SunOutlined, CopyOutlined, DownloadOutlined } from '@ant-design/icons'
//复制按钮
import copy from 'copy-to-clipboard'
// 引入下载文件函数
import { downloadFiles } from '../../utils';
import { useContext } from 'react';
import { PlaygroundContext } from '../../PlaygroundContext';
import { message, Button } from 'antd';
export default function Header() {
  const { theme, setTheme, files } = useContext(PlaygroundContext)
  const [messageApi, contextHolder] = message.useMessage();
  return (
    <div className={styles.header}>
      <div className={styles.logo}>
        <img alt='logo' src={logoSvg} />
        <span>React Playground</span>
      </div>
      <div className={styles.links}>
        {theme === 'light' && (
          <MoonOutlined
            title='切换暗色主题'
            className={styles.theme}
            onClick={() => setTheme('dark')}
          />
        )}
        {theme === 'dark' && (
          <SunOutlined
            title='切换亮色主题'
            className={styles.theme}
            onClick={() => setTheme('light')}
          />
        )}
        <CopyOutlined
          title='复制当前代码'
          style={{ marginLeft: '20px' }}
          onClick={() => {
            copy(window.location.href);
            messageApi.success('分享链接已复制。')
          }}
        />
        <DownloadOutlined
          title='下载当前代码'
          style={{ marginLeft: '20px' }}
          onClick={async () => {
            try {
              await downloadFiles(files);
              messageApi.success('代码已下载。');
            } catch (error) {
              messageApi.error('下载失败，请稍后重试。');
            }
          }}
        />
      </div>
      {contextHolder}

    </div>
  )
}