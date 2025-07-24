## GitHub Copilot Chat

- Extension Version: 0.29.0 (prod)
- VS Code: vscode/1.102.0
- OS: Windows

## Network

User Settings:
```json
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 20.207.73.85 (3 ms)
- DNS ipv6 Lookup: Error (4 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (0 ms)
- Electron fetch (configured): HTTP 200 (92 ms)
- Node.js https: HTTP 200 (112 ms)
- Node.js fetch: HTTP 200 (289 ms)

Connecting to https://api.individual.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.112.22 (2 ms)
- DNS ipv6 Lookup: Error (3 ms): getaddrinfo ENOTFOUND api.individual.githubcopilot.com
- Proxy URL: None (0 ms)
- Electron fetch (configured): HTTP 200 (761 ms)
- Node.js https: HTTP 200 (777 ms)
- Node.js fetch: HTTP 200 (746 ms)

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).