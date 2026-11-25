import { NormalizationService } from "../packages/discovery/services/normalization-service.js";
import { DeduplicationService } from "../packages/discovery/services/deduplication-service.js";
import { SearchProvider } from "../packages/discovery/providers/search-provider.js";
import { PlacesProvider } from "../packages/discovery/providers/places-provider.js";
import { DirectoryProvider } from "../packages/discovery/providers/directory-provider.js";
import { CsvProvider } from "../packages/discovery/providers/csv-provider.js";

async function runTests() {
  console.log("=== RUNNING PHASE 3 LEAD DISCOVERY ENGINE TESTS ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  // Test 1: Domain extraction & Normalization
  const domain1 = NormalizationService.extractDomain("https://www.AuraLogistics.io/contact?ref=google");
  assert(domain1 === "auralogistics.io", "Extract normalized domain from complex URL");

  const domain2 = NormalizationService.extractDomain("http://sub.domain.co.uk/");
  assert(domain2 === "sub.domain.co.uk", "Handle international subdomain URL");

  // Test 2: Company name cleaning
  const cleanedName = NormalizationService.normalizeCompanyName("Acme Logistics, Inc.");
  assert(cleanedName === "acme logistics", "Strip legal suffixes (Inc., punctuation)");

  // Test 3: Deduplication by normalized domain
  const existingRecords = [
    { id: "rec-1", name: "Aura Logistics Group", domain: "auralogistics.io", country: "United States" }
  ];

  const candidateDuplicate = NormalizationService.normalize({
    companyName: "Aura Freight Partners",
    websiteUrl: "https://auralogistics.io",
    country: "United States",
    providerName: "Search API",
    discoveryTimestamp: new Date().toISOString()
  });

  const check1 = DeduplicationService.checkDuplicate(candidateDuplicate, existingRecords);
  assert(check1.isDuplicate === true && check1.matchedReason === "domain", "Detect duplicate by normalized domain");

  // Test 4: Deduplication by Company Name + Country
  const candidateDuplicateByName = NormalizationService.normalize({
    companyName: "Aura Logistics, LLC",
    websiteUrl: null, // missing website
    country: "United States",
    providerName: "Directory",
    discoveryTimestamp: new Date().toISOString()
  });

  const check2 = DeduplicationService.checkDuplicate(candidateDuplicateByName, existingRecords);
  assert(check2.isDuplicate === true && check2.matchedReason === "company_and_location", "Detect duplicate by company name and country");

  // Test 5: Unique Lead Identification
  const candidateUnique = NormalizationService.normalize({
    companyName: "Brand New CleanTech Corp",
    websiteUrl: "https://cleantech-innovations.se",
    country: "Sweden",
    providerName: "Search API",
    discoveryTimestamp: new Date().toISOString()
  });

  const check3 = DeduplicationService.checkDuplicate(candidateUnique, existingRecords);
  assert(check3.isDuplicate === false, "Allow brand new unique business record");

  // Test 6: CSV Parsing Provider
  const sampleCsv = `Company Name,Website,Industry,Country,Email
Acme Robotics,https://acme-robotics.ai,Robotics,Canada,info@acme-robotics.ai
Solaris Clean Energy,https://solarisclean.com,Renewable Energy,Germany,hello@solarisclean.com`;

  const csvProvider = new CsvProvider();
  const parsedCsv = csvProvider.parseCsv(sampleCsv);
  assert(parsedCsv.length === 2, "Parse multi-row CSV lead dataset");
  assert(parsedCsv[0].companyName === "Acme Robotics", "Correctly map company name header in CSV");
  assert(parsedCsv[0].publicEmail === "info@acme-robotics.ai", "Extract email from CSV");

  // Test 7: Provider Adapters (Search, Places, Directory)
  const searchProvider = new SearchProvider();
  const searchResults = await searchProvider.search({
    country: "United States",
    industry: "Logistics",
    limit: 2
  });
  assert(searchResults.length > 0, "Search provider returns structured candidate leads");

  const placesProvider = new PlacesProvider();
  const placesResults = await placesProvider.search({
    country: "United States",
    city: "Chicago",
    industry: "Manufacturing"
  });
  assert(placesResults.length > 0, "Places provider returns location-aware business leads");

  const directoryProvider = new DirectoryProvider();
  const dirResults = await directoryProvider.search({
    country: "United Kingdom",
    industry: "Biotech"
  });
  assert(dirResults.length > 0, "Directory provider returns public corporate registered entity");

  console.log(`\nTEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runTests();
