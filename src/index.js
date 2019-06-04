const loggingConstants = require('./constants/logging.constants');
const {
    getProgram,
    getRepoCommits,
    commitNewCommits,
    initialiseRepo,
    validateArguments,
    commitResultData,
} = require('./worker');

const main = async () => {
    const program = getProgram();

    try {
        validateArguments({ program });
        const inputDirectory = program.inputDirectory;
        const outputDirectory = program.outputDirectory;
        const repoName = program.repoName;
        const emailFilterList = program.emailFilter.split(',');
        const commitEmail = program.commitEmail;

        const repoCommits = await getRepoCommits({ inputDirectory });
        const gitDirectory = await initialiseRepo({ outputDirectory, repoName, repoCommits });
        const resultData = await commitNewCommits({
            gitDirectory,
            repoCommits,
            emailFilterList,
            commitEmail,
        });

        await commitResultData({ gitDirectory, resultData });
        console.log('All Done.');
    } catch (error) {
        console.error(loggingConstants.genericError({ errorMessage: error.toString() }));
    }
};

(async () => {
    await main();
})();
