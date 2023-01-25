## Typescript-Node.js Template

[![Build Badge](https://github.com/EddieWongED/Smoothie/actions/workflows/build.yaml/badge.svg)](https://github.com/EddieWongED/Smoothie/actions/workflows/build.yaml)
[![Eslint Check Badge](https://github.com/EddieWongED/Smoothie/actions/workflows/eslint.yaml/badge.svg)](https://github.com/EddieWongED/Smoothie/actions/workflows/eslint.yaml)
[![Format Check Badge](https://github.com/EddieWongED/Smoothie/actions/workflows/format.yaml/badge.svg)](https://github.com/EddieWongED/Smoothie/actions/workflows/format.yaml)

-   In VSCode settings, append the following to use eslint by default:

```json
{
	...
	"[typescript]": {
		"editor.defaultFormatter": "esbenp.prettier-vscode"
	},
	"[json]": {
		"editor.defaultFormatter": "esbenp.prettier-vscode"
	},
	"editor.codeActionsOnSave": {
		"source.fixAll.eslint": true
	},
	"eslint.validate": ["typescript"],
	"eslint.format.enable": true
}
```
