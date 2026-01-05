const projectIds = [7138, 7139];
const dbIdsBigInt = ["7138", "7140"]; // PG returns bigint as string
const dbIdsNumber = [7138, 7140];      // Just in case

const validProjectIds = new Set([
    ...dbIdsBigInt.map(id => String(id)),
    ...dbIdsNumber.map(id => String(id))
]);

console.log('Valid IDs:', Array.from(validProjectIds));

const missingProjects = projectIds.filter(id => !validProjectIds.has(String(id)));

console.log('Missing Projects:', missingProjects);

if (missingProjects.length === 1 && missingProjects[0] === 7139) {
    console.log('SUCCESS: Logic works as expected.');
} else {
    console.log('FAILURE: Logic is flawed.');
}
