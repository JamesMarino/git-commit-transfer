const options = [
    {
        optionName: 'inputDirectory',
        param: '-i, --input-directory <value>',
        description: 'Directory containing directories of git repositories',
    },
    {
        optionName: 'outputDirectory',
        param: '-o, --output-directory <value>',
        description: 'Directory of the output repository',
    },
    {
        optionName: 'repoName',
        param: '-o, --repo-name <value>',
        description: 'Name of the new repository to create',
    },
    {
        optionName: 'emailFilter',
        param: '-o, --email-filter <items>',
        description: 'Filter commits by email. This is a comma separated list',
    },
    {
        optionName: 'commitEmail',
        param: '-o, --commit-email <value>',
        description: 'What email to commit as',
    },
];

module.exports = options;
