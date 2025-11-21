# @videohub/shared

Shared utilities and constants for the VideoHub monorepo.

## Usage

```javascript
import { formatNumber, formatTime, APP_NAME } from '@videohub/shared';

const views = formatNumber(1500000); // "1.5M"
const time = formatTime(3661); // "61:01"
```

## Exports

- `APP_NAME` - Application name constant
- `APP_VERSION` - Application version constant
- `formatNumber(num)` - Format large numbers (e.g., 1500000 → "1.5M")
- `formatTime(seconds)` - Format seconds to MM:SS format

