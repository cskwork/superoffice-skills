# Install superoffice

<details>
<summary><strong>Claude Code</strong></summary>

### Install

```bash
claude plugin marketplace add cskwork/superoffice
claude plugin install superoffice@superoffice
```

Type `/superoffice`.

### Verify

```bash
claude plugin list
```

### Update

```bash
claude plugin marketplace update superoffice
```

### Uninstall

```bash
claude plugin uninstall superoffice
claude plugin marketplace remove superoffice
```

</details>

<details>
<summary><strong>Codex</strong></summary>

### Install

```bash
codex plugin marketplace add cskwork/superoffice --ref main
codex plugin add superoffice@superoffice
```

Type `$superoffice`.

### Verify

```bash
codex plugin list
```

### Uninstall

```bash
codex plugin remove superoffice
codex plugin marketplace remove superoffice
```

</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

### Install (extension, always-on)

```bash
gemini extensions install https://github.com/cskwork/superoffice
```

### Install (command, opt-in)

```bash
mkdir -p ~/.gemini/commands
curl -fsSL https://raw.githubusercontent.com/cskwork/superoffice/main/skills/superoffice/agents/gemini.toml \
  -o ~/.gemini/commands/superoffice.toml
```

Type `/superoffice` in a new session.

### Verify

```bash
gemini extensions list
```

### Uninstall

```bash
gemini extensions uninstall superoffice
```

</details>

<details>
<summary><strong>Cursor, OpenCode, Amp, and other agent-skills harnesses</strong></summary>

### Install

```bash
npx skills add cskwork/superoffice
npx skills add cskwork/superoffice -g
```

Type `/superoffice` in a new agent chat.

### Verify

```bash
npx skills list
```

### Update

```bash
npx skills update superoffice
```

### Uninstall

```bash
npx skills remove superoffice
```

</details>

<details>
<summary><strong>Antigravity (agy)</strong></summary>

### Install

```bash
agy plugin install https://github.com/cskwork/superoffice
```

### Verify

```bash
agy plugin list
```

### Uninstall

```bash
agy plugin uninstall superoffice
```

</details>
