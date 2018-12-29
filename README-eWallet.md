## 技术框架
 Electron, React, Redux, React Router, Webpack ，React Hot Loader，trezor-link

## 自己的一些想法
eWallet 是一个基于 Electron 的 PC 端跨平台数字钱包，使用 Trezor 作为安全硬件。

### 为什么选用 Electron
使用 Electron 主要是因为在数字货币圈里 js 可使用的工具比较多，并且可以开发出比较友好的 UI。 

### 为什么开发 PC 端客户端而不适用web
使用安全硬件设备的数字钱包都比较难解决 WEB 应用与 USB 等安全设备的通信，往往都有浏览器品牌以及版本的限制，并且用户需要安装一些浏览器 plugin
或者 extension。  
鉴于此情况，还不如开发一个 PC 端客户端，避免了浏览器繁琐的配置。  
目前使用的 trezor 与其设备通信使用的是 trezor-link.js 库，由于 trezor 不再支持使用 node-usb，所以等核心业务开发完成之后实现 node-usb，
目前使用的通信方式还是 golang 实现的本地 http 服务。
