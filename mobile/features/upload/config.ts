export interface FieldDef {
  key: string;
  label: string;
  required?: boolean;
  multiline?: boolean;
  validate?: (v: string) => string | null;
}

export const UPLOAD_SINGLE_ATTRS: FieldDef[] = [
  {
    key: "category",
    label: "Category",
    required: true,
    validate: (v) => (!v.trim() ? "Category is required" : null),
  },
  {
    key: "type",
    label: "Subcategory / Type",
    required: true,
    validate: (v) => (!v.trim() ? "Subcategory / Type is required" : null),
  },
  {
    key: "color",
    label: "Color",
    required: true,
    validate: (v) => (!v.trim() ? "Color is required" : null),
  },
  { key: "brand", label: "Brand" },
  { key: "pattern", label: "Pattern" },
  { key: "material", label: "Material" },
  { key: "style", label: "Style" },
  { key: "neckline", label: "Neckline" },
  { key: "sleeve_length", label: "Sleeve Length" },
  { key: "fit", label: "Fit" },
  { key: "length", label: "Length" },
  { key: "description", label: "Description", multiline: true },
];

export const DEFAULT_SEASONS = ["Spring", "Summer", "Autumn", "Winter"];

export const DEFAULT_OCCASIONS = [
  "Casual",
  "Formal",
  "Workwear",
  "Evening",
  "Sportswear",
  "Party",
  "Loungewear",
];
