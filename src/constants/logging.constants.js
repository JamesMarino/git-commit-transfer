const logging = {
    commitExtractionFinished: 'Extracted Commits all Commits.',
    repositoryCommitsFinished: ({ repoName, logPath, commitCount }) =>
        `Committing from ${repoName} to ${logPath}. Found ${commitCount} commits.`,
    finalCommits: 'Finished committing to paths.',
    initialCommitMessage: 'Initial Commit',
    finalCommitMessage: 'Final Commit',
    initialCommitNotification: 'Initialised Repository.',
    argumentsInvalid: 'Invalid Arguments. Use --help if necessary.',
    defaultName: 'John Doe',
    defaultEmail: 'john.doe@example.com',
    initialReadMeText: '# GitTransfer Results',
    finalReadMeText: ({ resultData }) =>
        `\n\nFinal Results of Transfer\n\n\`\`\`json\n${JSON.stringify(resultData, null, 4)}\`\`\``,
    genericError: ({ errorMessage }) => `Error: ${errorMessage}`,
};

module.exports = logging;
