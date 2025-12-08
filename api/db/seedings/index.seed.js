import queryRouterSeed from "./query-router.seed.js";

export default async function seed() {
    return Promise.all([
        queryRouterSeed(),
    ]);
}