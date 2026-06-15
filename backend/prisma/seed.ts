import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const GENRES = [
    { name: "Action", slug: "action" },
    { name: "Aventure", slug: "aventure" },
    { name: "Animation", slug: "animation" },
    { name: "Anime", slug: "anime" },
    { name: "Biographie", slug: "biographie" },
    { name: "Comédie", slug: "comedie" },
    { name: "Comédie romantique", slug: "comedie-romantique" },
    { name: "Crime", slug: "crime" },
    { name: "Documentaire", slug: "documentaire" },
    { name: "Drame", slug: "drame" },
    { name: "Espionnage", slug: "espionnage" },
    { name: "Famille", slug: "famille" },
    { name: "Fantastique", slug: "fantastique" },
    { name: "Guerre", slug: "guerre" },
    { name: "Historique", slug: "historique" },
    { name: "Horreur", slug: "horreur" },
    { name: "Musical", slug: "musical" },
    { name: "Mystère", slug: "mystere" },
    { name: "Policier", slug: "policier" },
    { name: "Romance", slug: "romance" },
    { name: "Science-fiction", slug: "science-fiction" },
    { name: "Sport", slug: "sport" },
    { name: "Super-héros", slug: "super-heros" },
    { name: "Thriller", slug: "thriller" },
    { name: "Western", slug: "western" },
];

async function main() {
    for (const genre of GENRES) {
        await prisma.genre.upsert({
            where: { slug: genre.slug },
            update: { name: genre.name },
            create: genre,
        });
    }
    console.log(`Seeded ${GENRES.length} genres.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
