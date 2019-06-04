const fs = require('fs').promises;
const path = require('path');
const commander = require('commander');
const git = require('simple-git/promise');
const fileUtils = require('./utils/file.utils');

const getProgram = () => {
    const program = new commander.Command();
    program.version('1.0.0');
    program.option(
        '-d, --directory <directory>',
        'Directory containing directories of git repositories',
    );

    program.parse(process.argv);
    return program;
};

const getWorkingDirectory = ({ program }) => {
    const inputDirectory = program.directory;
    let currentDirectory = inputDirectory;

    if (!inputDirectory || !fileUtils.isDirectory({ directory: inputDirectory })) {
        currentDirectory = process.cwd();
    }

    return currentDirectory;
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

const getAllCommits = async ({ workingDirectory }) => {
    const directories = fileUtils.getDirectories({
        directory: workingDirectory,
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
    return commitList;
};

const isValidCommit = ({ commit, emailFilterList }) => {
    return emailFilterList.includes(commit.author_email);
};

const commitNewCommits = async ({ gitDirectory, allCommits }) => {
    const repository = git(gitDirectory);
    const finishedLogPaths = [];

    for (const repos of allCommits) {
        const { repoLog } = repos.commits;
        const logPath = `${gitDirectory}/log/${repos.repository}.log`;

        for (const commit of repoLog) {
            if (isValidCommit({ commit, emailFilterList: ['james@marino.io'] })) {
                await fs.appendFile(logPath, `${commit.message}\n`);
                await repository.add(logPath);
                await repository.commit(`${repos.repository} - '${commit.message}'`, {
                    '--author': `${commit.author_name ? commit.author_name : 'Your Name'} <${
                        commit.author_email ? commit.author_email : 'name@example.com'
                    }>`,
                    '--date': `${commit.date}`,
                });
            }
        }

        finishedLogPaths.push(logPath);
    }

    return finishedLogPaths;
};

const initialiseRepo = async ({ newDirectory, repoName, allCommits }) => {
    const completeNewDirectory = `${newDirectory}/${repoName}`;
    const readMePath = `${completeNewDirectory}/README.md`;
    const commitPath = `${completeNewDirectory}/commit.json`;
    const logPath = `${completeNewDirectory}/log`;

    await fs.mkdir(completeNewDirectory, { recursive: true });
    await fs.mkdir(logPath, { recursive: true });

    await fs.appendFile(readMePath, '# Git Transfer Data');
    await fs.appendFile(commitPath, JSON.stringify(allCommits, null, 4));

    const repository = git(completeNewDirectory);
    await repository.init(false);
    await repository.add([readMePath, commitPath]);
    await repository.commit('Initial Commit');

    return completeNewDirectory;
};

const main = async () => {
    const program = getProgram();
    const workingDirectory = getWorkingDirectory({ program });
    const allCommits = await getAllCommits({ workingDirectory });
    const gitDirectory = await initialiseRepo({
        newDirectory: '/Users/james/Desktop',
        repoName: 'my-repo',
        allCommits,
    });
    await commitNewCommits({ gitDirectory, allCommits });
};

main();
