const fs = require('fs').promises;
const path = require('path');
const commander = require('commander');
const git = require('simple-git/promise');
const fileUtils = require('./utils/file.utils');
const optionsConstants = require('./constants/options.constants');

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

    console.log('Extracted Commits all Commits.');
    return commitList;
};

const isValidCommit = ({ commit, emailFilterList }) => {
    return emailFilterList.includes(commit.author_email);
};

const commitNewCommits = async ({ gitDirectory, repoCommits, emailFilter }) => {
    const repository = git(gitDirectory);
    const finishedLogPaths = [];

    for (const repos of repoCommits) {
        const { repoLog } = repos.commits;
        const logPath = `${gitDirectory}/log/${repos.repository}.log`;
        let commitCount = 0;

        for (const commit of repoLog) {
            if (isValidCommit({ commit, emailFilterList: [emailFilter] })) {
                await fs.appendFile(logPath, `${commit.message}\n`);
                await repository.add(logPath);
                await repository.commit(`${repos.repository} - '${commit.message}'`, {
                    '--author': `${commit.author_name ? commit.author_name : 'Your Name'} <${
                        commit.author_email ? commit.author_email : 'name@example.com'
                    }>`,
                    '--date': `${commit.date}`,
                });
                commitCount += 1;
            }
        }

        console.log(
            `Committing from ${repos.repository} to ${logPath}. Found ${commitCount} commits.`,
        );
        finishedLogPaths.push(logPath);
    }

    console.log(`Finished committing to paths.`);
    return finishedLogPaths;
};

const initialiseRepo = async ({ outputDirectory, repoName, repoCommits }) => {
    const completeNewDirectory = `${outputDirectory}/${repoName}`;
    const readMePath = `${completeNewDirectory}/README.md`;
    const commitPath = `${completeNewDirectory}/commit.json`;
    const logPath = `${completeNewDirectory}/log`;

    await fs.mkdir(completeNewDirectory, { recursive: true });
    await fs.mkdir(logPath, { recursive: true });

    await fs.appendFile(readMePath, '# Git Transfer Data');
    await fs.appendFile(commitPath, JSON.stringify(repoCommits, null, 4));

    const repository = git(completeNewDirectory);
    await repository.init(false);
    await repository.add([readMePath, commitPath]);
    await repository.commit('Initial Commit');

    console.log('Initialised Repository.');
    return completeNewDirectory;
};

const validateArguments = ({ program }) => {
    optionsConstants.forEach(option => {
        if (!program[option.optionName]) {
            throw new Error('Invalid Arguments. Use --help if necessary.');
        }
    });
};

module.exports = {
    getProgram,
    getRepoCommits,
    commitNewCommits,
    initialiseRepo,
    validateArguments,
};
