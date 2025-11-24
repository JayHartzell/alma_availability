# Alma Availability

A lightweight web component for displaying real-time item availability from Ex Libris Alma.

## Resources
- [SRU Developer's Network Documentation](https://developers.exlibrisgroup.com/alma/integrations/sru/)

- [How to Configure the SRU Integration Profile and Structure SRU Retrieval Queries](https://developers.exlibrisgroup.com/blog/how-to-configure-the-sru-integration-profile-and-structure-sru-retrieval-queries/)

## Libguides Quick Start

### 1. Download the file
Download the *alma-availability.js* file and save it somewhere.

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
    library-code="INSTITUTION_CODE"
    mms-id="99100001234567891"
    location-code="main">
  </alma-availability>
</div>
```

## Required Attributes

| Attribute | Description |
|-----------|-------------|
| `base-url` | Your Alma domain |
| `library-code` | Your institution's library code |
| `mms-id` | Bibliographic record ID from Alma |
| `location-code` | Location code for the item | 

## Styling

Customize colors by wrapping the component in a div with CSS custom properties:

```html
<style>
  .availability-widget {
    /* Text & Background */
    --alma-text-color: #2c2c2c;
    --alma-bg-color: #fafafa;
    --alma-border-color: #dddddd;
    
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
    library-code="INSTITUTION_CODE"
    mms-id="99100001234567891"
    location-code="main">
  </alma-availability>
</div>
```

### Available CSS Custom Properties

| Property | Default | Purpose |
|----------|---------|---------|
| `--alma-text-color` | `#333` | Main text color |
| `--alma-bg-color` | `#f9f9f9` | Background color |
| `--alma-border-color` | `#ddd` | Border color |
| `--alma-available-color` | `#28a745` | Available status color |
| `--alma-unavailable-color` | `#dc3545` | Unavailable status color |
| `--alma-error-color` | `#721c24` | Error text color |
| `--alma-error-bg` | `#f8d7da` | Error background color |

## Example Output

The component displays:

```text
Main Branch Circulating Technology
5 / 10 
Available
```

## Browser Support

- Chrome 67+
- Firefox 63+
- Safari 10.1+
- Edge 79+

## No Dependencies

Built with vanilla JavaScript. No frameworks or external libraries required.

## License

MIT