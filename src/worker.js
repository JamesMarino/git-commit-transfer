const fs = require('fs').promises;
const path = require('path');
const commander = require('commander');
const git = require('simple-git/promise');

const fileUtils = require('./utils/file.utils');
const optionsConstants = require('./constants/options.constants');
const loggingConstants = require('./constants/logging.constants');
const pathConstants = require('./constants/paths.constants');

const getProgram = () => {
    const program = new commander.Command();
    program.version('1.0.0');

    optionsConstants.forEach(option => {
        program.option(option.param, option.description);
    });

    program.parse(process.argv);
    return program;
};

const getCommits = async ({ workingDirectory }) => {
    const repository = git(workingDirectory);
    const isValidRepo = await repository.checkIsRepo();

    if (!isValidRepo) {
        return {
            isValidRepo,
            repoLog: [],
        };
    }

    const repoLog = await repository.log();

    return {
        isValidRepo,
        repoLog: repoLog.all,
    };
};

const getRepoCommits = async ({ inputDirectory }) => {
    const directories = fileUtils.getDirectories({
        directory: inputDirectory,
    });

    const commitList = [];

    directories.forEach(currentDirectory => {
        commitList.push({
            repository: path.basename(currentDirectory),
            directory: currentDirectory,
            commits: getCommits({ workingDirectory: currentDirectory }),
        });
    });

    const resolvedCommits = await Promise.all(commitList.map(commit => commit.commits));
    commitList.forEach((commit, index) => (commit.commits = resolvedCommits[index]));

    console.log(loggingConstants.commitExtractionFinished);
    return commitList;
};

const isValidCommit = ({ commit, emailFilterList }) => {
    return emailFilterList.includes(commit.author_email);
};

const commitNewCommits = async ({ gitDirectory, repoCommits, emailFilter }) => {
    const repository = git(gitDirectory);
    const finishedCommitDetails = [];

    for (const repos of repoCommits) {
        const { repoLog } = repos.commits;
        const logPath = `${gitDirectory}${pathConstants.loggingDirectory}${repos.repository}${
            pathConstants.loggingFileExtension
        }`;
        let commitCount = 0;

        for (const commit of repoLog) {
            if (isValidCommit({ commit, emailFilterList: [emailFilter] })) {
                await fs.appendFile(logPath, `${commit.message}\n`);
                await repository.add(logPath);
                await repository.commit(`${repos.repository} - '${commit.message}'`, {
                    '--author': `${
                        commit.author_name ? commit.author_name : loggingConstants.defaultName
                    } <${
                        commit.author_email ? commit.author_email : loggingConstants.defaultEmail
                    }>`,
                    '--date': `${commit.date}`,
                });
                commitCount += 1;
            }
        }

        console.log(
            loggingConstants.repositoryCommitsFinished({
                repoName: repos.repository,
                logPath,
                commitCount,
            }),
        );

        finishedCommitDetails.push({
            repoName: repos.repository,
            logPath,
            commitCount,
        });
    }

    console.log(loggingConstants.finalCommits);
    return finishedCommitDetails;
};

const initialiseRepo = async ({ outputDirectory, repoName, repoCommits }) => {
    const completeNewDirectory = `${outputDirectory}/${repoName}`;
    const readMePath = `${completeNewDirectory}/${pathConstants.readmeFile}`;
    const commitPath = `${completeNewDirectory}/${pathConstants.commitJsonFile}`;
    const logPath = `${completeNewDirectory}${pathConstants.loggingDirectory}`;

    if (fileUtils.directoryExists({ directory: completeNewDirectory })) {
        fileUtils.renameDirectoryTimestamp({ oldDirectory: completeNewDirectory });
    }

    await fs.mkdir(completeNewDirectory, { recursive: true });
    await fs.mkdir(logPath, { recursive: true });

    await fs.appendFile(readMePath, loggingConstants.initialReadMeText);
    await fs.appendFile(commitPath, JSON.stringify(repoCommits, null, 4));

    const repository = git(completeNewDirectory);
    await repository.init(false);
    await repository.add([readMePath, commitPath]);
    await repository.commit(loggingConstants.initialCommitMessage);

    console.log(loggingConstants.initialCommitNotification);
    return completeNewDirectory;
};

const validateArguments = ({ program }) => {
    optionsConstants.forEach(option => {
        if (!program[option.optionName]) {
            throw new Error(loggingConstants.argumentsInvalid);
        }
    });
};

const commitResultData = async ({ gitDirectory, resultData }) => {
    const readMePath = `${gitDirectory}/${pathConstants.readmeFile}`;
    await fs.appendFile(readMePath, loggingConstants.finalReadMeText({ resultData }));

    const repository = git(gitDirectory);
    await repository.add(readMePath);
    await repository.commit(loggingConstants.finalCommitMessage);
};

module.exports = {
    getProgram,
    getRepoCommits,
    commitNewCommits,
    initialiseRepo,
    validateArguments,
    commitResultData,
};
