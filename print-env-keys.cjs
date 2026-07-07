console.log("=== Node.js process.env Keys ===");
for (const key of Object.keys(process.env)) {
  if (key.includes("MONGO") || key.includes("URI") || key.includes("DB")) {
    const val = process.env[key];
    console.log(`${key}: type=${typeof val}, length=${val ? val.length : 0}, preview=${val ? val.substring(0, 30) : ""}`);
  }
}
