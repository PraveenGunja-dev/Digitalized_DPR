# Excel Table Enhancements

## Overview

The Excel table component has been enhanced with professional styling and advanced theming capabilities. This document explains the new features and how to use them.

## Features

### 1. Professional Excel Styling

The table now has a professional Excel-like appearance with:
- Authentic Excel color schemes aligned with the application theme
- Proper alternating row colors
- Accurate Excel-style borders and typography
- Active cell highlighting with theme colors

### 2. Dynamic Theme Alignment

The table theme now dynamically aligns with the application theme toggle:
- Automatically switches between light and dark themes
- Maintains consistent appearance with the rest of the application
- No manual theme selection needed

### 3. Column Color Customization

Users can still customize individual column colors:
- 12 predefined colors in the palette
- Per-column color selection via dropdown picker (space-efficient)
- Colors apply to both header and cells with appropriate transparency
- Reset option to remove custom colors

## How to Use

### Basic Usage

```tsx
import { StyledExcelTable } from "@/components/StyledExcelTable";

<StyledExcelTable
  title="My Table"
  columns={columns}
  data={tableData}
  onDataChange={handleDataChange}
  onSave={handleSave}
/>
```

### Adding Column Colors

```tsx
<StyledExcelTable
  title="My Table"
  columns={columns}
  data={tableData}
  onDataChange={handleDataChange}
  onSave={handleSave}
  initialColumnColors={{
    "Description": "#0B74B0",
    "Quantity": "#75479C",
    "Status": "#BD3861"
  }}
/>
```

### Using Column Types

```tsx
<StyledExcelTable
  title="My Table"
  columns={columns}
  data={tableData}
  onDataChange={handleDataChange}
  onSave={handleSave}
  columnTypes={{
    "Quantity": "number",
    "Date": "date",
    "Notes": "text"
  }}
/>
```

## Available Props

| Prop | Type | Description |
|------|------|-------------|
| title | string | Table title |
| columns | string[] | Column headers |
| data | any[][] | Table data |
| onDataChange | function | Callback when data changes |
| onSave | function | Save callback |
| onSubmit | function | Submit callback |
| isReadOnly | boolean | Disable editing |
| excludeColumns | string[] | Hide specific columns |
| editableColumns | string[] | Allow editing specific columns in read-only mode |
| columnTypes | Record<string, 'text' | 'number' | 'date'> | Input types for columns |
| initialColumnColors | Record<string, string> | Initial column colors |

## Color Palette

The available colors for column customization:

1. #0B74B0 (Blue)
2. #75479C (Purple)
3. #BD3861 (Pink)
4. #22A04B (Green)
5. #FF6B35 (Orange)
6. #F7931E (Amber)
7. #C44536 (Red)
8. #4A6FA5 (Indigo)
9. #6B5B95 (Violet)
10. #88B785 (Light Green)
11. #E6AE4E (Gold)
12. #9E4C98 (Magenta)

## Implementation Details

### Theme Configuration

Themes are defined in `themeConfig` with dynamic configuration aligned with the application:
- Light theme: #C7CCD1 headers, white/#F8FBFF rows
- Dark theme: #2D2D2D headers, #1E1E1E/#242424 rows
- Automatic switching based on application theme

### CSS Variables

All colors are managed through CSS variables for easy theme switching:
- `--excel-header-bg`
- `--excel-row1-bg`
- `--excel-row2-bg`
- `--excel-text-color`
- And more...

### Column Coloring Logic

1. Headers use the full color
2. Cells use the color with 20% opacity (`${color}20`)
3. Active cells override column colors with theme-specific active cell background
4. Custom colors override theme colors but not active cell highlighting

## Migration from ExcelTable

To migrate from the old `ExcelTable` component:

1. Change import:
   ```tsx
   // Old
   import { ExcelTable } from "@/components/ExcelTable";
   
   // New
   import { StyledExcelTable } from "@/components/StyledExcelTable";
   ```

2. Replace component usage:
   ```tsx
   // Old
   <ExcelTable {...props} />
   
   // New
   <StyledExcelTable {...props} />
   ```

3. Optionally add column colors:
   ```tsx
   <StyledExcelTable 
     {...props} 
     initialColumnColors={{
       "ColumnName": "#HEXCOLOR"
     }}
   />
   ```

## Dynamic Theme Alignment

The table now automatically aligns with the application theme:
- Observes DOM class changes to detect theme switches
- Updates all styling instantly when theme changes
- Maintains consistency with navbar and other UI elements

## Simplified Toolbar

The toolbar has been simplified to remove theme selection options:
- Column color picker remains for customization
- Save button is always visible when `onSave` prop is provided
- Fullscreen toggle button for expanded view
- Theme automatically aligns with application

## Save Button Visibility

The save button is now always visible when the `onSave` prop is provided, regardless of the read-only state. This ensures users can always save their work as a draft, even when the table is in a read-only mode for other purposes.

## Troubleshooting

### Common Issues

1. **Empty String Error**: The "None" option now uses "none" as a value instead of an empty string to comply with Radix UI requirements. The component automatically converts this back to an empty string when setting the color.

2. **Color Not Applying**: Make sure you're using the correct column names that exactly match those in your `columns` array.

3. **Save Button Missing**: The save button is always visible when the `onSave` prop is provided. If you don't see it, make sure you're passing the `onSave` prop to the component.