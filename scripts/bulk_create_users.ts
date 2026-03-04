import insforge from "../src/lib/insforge";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const usersToCreate = [
    // Admins
    { email: "geovsualdm@gmail.com", password: "SNR#26$Customer", name: "GEO", role: "admin" },
    { email: "info.vsualdm@gmail.com", password: "SNR#26$Customer", name: "SAL", role: "admin" },
    { email: "info@snewroof.com", password: "SNR#26$Customer", name: "SAM", role: "admin" },

    // Team
    { email: "marisnewroof2023@gmail.com", password: "Maria@#SNR&26", name: "Maria (Team)", role: "team" },

    // Customers
    { email: "tomvuong@gmail.com", password: "SNR2026#Roof", name: "Tom Vuong", role: "customer" },
    { email: "brett@gmail.com", password: "SNR2026#Roof", name: "Brett", role: "customer" },
    { email: "mohontotopu48@gmail.com", password: "SNR2026#Roof", name: "Lorraine", role: "customer" },
];

async function bulkCreate() {
    console.log("Starting bulk user creation...");

    for (const user of usersToCreate) {
        console.log(`\nAttempting to create user: ${user.name} (${user.email})...`);

        const { error } = await insforge.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
                data: {
                    name: user.name,
                    role: user.role
                }
            }
        });

        if (error) {
            if (error.message.includes("already registered")) {
                console.log(`User already exists: ${user.email}`);
            } else {
                console.error(`Error creating user ${user.email}:`, error.message);
            }
        } else {
            console.log(`Successfully created user: ${user.email}`);
        }
    }

    console.log("\nBulk creation complete.");
}

bulkCreate();
