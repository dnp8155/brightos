import { parse } from "csv-parse/sync";
import { RawDiscoveredLead } from "../types/lead";

export class CsvProvider {
  public name = "CSV Lead Import Provider";

  /**
   * Parses raw CSV string or buffer into RawDiscoveredLead records
   */
  public parseCsv(csvContent: string): RawDiscoveredLead[] {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const timestamp = new Date().toISOString();

    return records.map((row: any) => {
      // Find matching column names regardless of case
      const findCol = (...aliases: string[]): string | null => {
        for (const alias of aliases) {
          for (const key of Object.keys(row)) {
            if (key.trim().toLowerCase() === alias.toLowerCase()) {
              return row[key] ? String(row[key]).trim() : null;
            }
          }
        }
        return null;
      };

      const companyName = findCol("company", "company name", "business", "business name", "organization", "name") || "Imported Business";
      const websiteUrl = findCol("website", "url", "domain", "web", "site");
      const industry = findCol("industry", "sector", "category") || "General B2B";
      const country = findCol("country", "nation", "region") || "United States";
      const city = findCol("city", "town", "metro");
      const publicEmail = findCol("email", "contact email", "business email");
      const publicPhone = findCol("phone", "telephone", "mobile", "tel");
      const description = findCol("description", "notes", "summary", "about");
      const companySize = findCol("size", "employees", "headcount", "company size");

      return {
        companyName,
        websiteUrl,
        description,
        industry,
        country,
        city,
        publicEmail,
        publicPhone,
        sourceUrl: "Uploaded CSV Dataset",
        providerName: this.name,
        discoveryTimestamp: timestamp,
        companySize,
        metadata: { original_csv_row: row }
      };
    });
  }
}
