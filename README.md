# Alma Availability

A lightweight web component for displaying real-time item availability from Ex Libris Alma.

## Resources
- [SRU Developer's Network Documentation](https://developers.exlibrisgroup.com/alma/integrations/sru/)

- [How to Configure the SRU Integration Profile and Structure SRU Retrieval Queries](https://developers.exlibrisgroup.com/blog/how-to-configure-the-sru-integration-profile-and-structure-sru-retrieval-queries/)

## Configure an SRU Integration Profile
Configure an SRU Server integration profile. Ensure the following parameters are set:
- Bibliographic Options
  - Active
  - Add Availability
- Holdings Options
   - Check all

## Libguides Quick Start

### 1. Download the file
Download the *alma-availability.js* file from the /dist folder and save it somewhere.

### 2. Upload the customization file
1. Navigate to *Admin* > *Look & Feel*
2. Select the *Custom JS/CSS* Tab
3. Under *Upload Customization Files* select *Upload a New File*, then browse for *alma.availability.js* on your device. Upload it.
4. Copy the Include Code / URL that is generated after upload.

### 3. Add and use the component
1. Find the box where you want the availability to appear.
2. Add Media/Widget
3. In your embed code, add the include code but change the type to "module", then call the component below it.
4. Add any custom css you want within the <style></style> tags. An example with fully customized css can be seen below:

```html
<script type="module" src="https://iepajfiejapjfeoa.cloudfront.net/sites/686/include/alma-availability.js"></script>
<style>
  .availability-widget {
    /* Text & Background */
    --alma-text-color: #2c2c2c;
    --alma-bg-color: transparent;
    --alma-border-color: transparent;
    
    /* Status Colors */
    --alma-available-color: #2d7a3a;
    --alma-unavailable-color: #b91c1c;
    
    /* Error Styling */
    --alma-error-color: #7c1e1e;
    --alma-error-bg: #fed7d7;
  }
</style>
<div class="availability-widget">
 <alma-availability 
    base-url="https://your-alma-instance.edu"
    institution-code="INSTITUTION_CODE"
    mms-id="99100001234567891"
    location-code="main">
  </alma-availability>
</div>
```

## Usage

### Basic Example

```html
 <alma-availability 
    base-url="https://yourInst.alma.exlibrisgroup.com"
    institution-code="01CACCL_INST"
    mms-id="99100001234567891"
    location-code="main">
  </alma-availability>
```

### With Custom Styling

```html
<style>
  .my-availability-widget {
    --alma-available-color: #0066cc;
    --alma-unavailable-color: #ff6600;
    --alma-text-color: #1a1a1a;
  }
</style>

<div class="my-availability-widget">
  <alma-availability 
    base-url="https://yourInst.alma.exlibrisgroup.com"
    institution-code="01CACCL_INST"
    mms-id="99100001234567891"
    location-code="main">
  </alma-availability>
</div>
```

## Required Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| `base-url` | Alma base URL | `https://yourInst.alma.exlibrisgroup.com` |
| `institution-code` | Institution code in Alma | `01CACCL_INST` |
| `mms-id` | Bibliographic record ID (MMS ID) | `99100001234567891` |
| `location-code` | Location code to check (e.g., from AVA subfield 'j') | `main` |

## CSS Custom Properties

Customize the appearance using CSS custom properties:

| Property | Default | Description |
|----------|---------|-------------|
| `--alma-text-color` | `#333` | Main text color |
| `--alma-bg-color` | `#f9f9f9` | Background color |
| `--alma-border-color` | `#ddd` | Border color |
| `--alma-available-color` | `#28a745` | "Available" status color (green) |
| `--alma-unavailable-color` | `#dc3545` | "Unavailable" status color (red) |
| `--alma-error-color` | `#721c24` | Error text color |
| `--alma-error-bg` | `#f8d7da` | Error background color |

### Example: Dark Theme

```css
:root {
  --alma-text-color: #e0e0e0;
  --alma-bg-color: #222;
  --alma-border-color: #444;
  --alma-available-color: #4ade80;
  --alma-unavailable-color: #f87171;
  --alma-error-color: #fca5a5;
  --alma-error-bg: #7f1d1d;
}
```

## Output

The component displays:
- **Location Name**: The human-readable location name from the AVA field
- **Availability Status**: "X / Y copies" showing available vs. total
- **Status Text**: "Available" or "Unavailable"

Example output:
```
Main Library Circulating Technology
5 / 10 copies
Available
```

## Error Handling

The component handles various error scenarios:

- **Missing attributes**: Displays error if required attributes are missing
- **Network errors**: User-friendly message if API is unreachable
- **Invalid XML**: Error if response is not valid MARCXML
- **Location not found**: Message if specified location doesn't exist in record
- **No AVA fields**: Error if response contains no availability data

## API Details

### SRU Query Format

The component constructs queries in this format:

```
{base-url}/view/sru/{institution-code}?version=1.2&operation=searchRetrieve&recordSchema=marcxml&query=alma.mms_id={mms-id}
```

### AVA Field Mapping

The component extracts data from the following MARC subfields:

| Subfield Code | Field Name | Usage |
|----------------|-----------|-------|
| `j` | Location Code | Location filtering |
| `c` | Location Name | Display |
| `e` | Availability Status | Available/Unavailable determination |
| `f` | Total Items | Display count |
| `g` | Items on Loan | Reference data |
| `q` | Library Name | Reference data |

## Development

If you want to modify the component or build from source:

### Setup

```bash
git clone https://github.com/JayHartzell/alma_availability.git
cd alma_availability
npm install
```

### Development Server

```bash
npm run dev
```

Open `demo.html` in your browser to test changes locally.

### Build for Production

```bash
npm run build
```

The built file will be at `dist/alma-availability.js`, ready for deployment.

### Project Structure

```
alma_availability/
├── dist/
│   └── alma-availability.js    ← Ready-to-use built file
├── src/
│   └── alma-availability.js    ← Source code (edit this)
├── demo.html                   ← Local testing
├── package.json
├── vite.config.js
└── README.md
```

## Browser Support

Works in all modern browsers supporting:
- Web Components (Custom Elements v1)
- Shadow DOM
- Fetch API
- DOMParser

Minimum supported versions:
- Chrome 67+
- Firefox 63+
- Safari 10.1+
- Edge 79+

## Troubleshooting

### Component not appearing

1. Check browser console for errors
2. Verify all required attributes are present
3. Ensure the script is loaded before the custom element is used

### "Network error" message

- Verify the `base-url` is correct and accessible
- Check CORS settings if using cross-origin requests
- Ensure the Alma instance is online

### "No AVA fields found"

- Verify the `mms-id` is correct
- Ensure the record has availability data in Alma
- Check that `institution-code` matches the institution code

### Location not found

- Verify the `location-code` matches an existing AVA field (subfield 'j')
- Use the simplified location code, not the full location name
- Check the example XML to see available location codes

## License

MIT

## Support

For issues, questions, or contributions, please contact your library's development team or submit an issue to the project repository.
