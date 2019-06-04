const {
    getProgram,
    getRepoCommits,
    commitNewCommits,
    initialiseRepo,
    validateArguments,
} = require('./worker');

const main = async () => {
    const program = getProgram();

    try {
        validateArguments({ program });
        const inputDirectory = program.inputDirectory;
        const outputDirectory = program.outputDirectory;
        const repoName = program.repoName;
        const emailFilter = program.emailFilter;

        const repoCommits = await getRepoCommits({ inputDirectory });
        const gitDirectory = await initialiseRepo({ outputDirectory, repoName, repoCommits });
        await commitNewCommits({ gitDirectory, repoCommits, emailFilter });
    } catch (error) {
        console.error(`Error: ${error.toString()}`);
    }
};

(async () => {
    await main();
})();
