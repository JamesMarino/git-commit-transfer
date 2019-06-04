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
        param: '-r, --repo-name <value>',
        description: 'Name of the new repository to create',
    },
    {
        optionName: 'emailFilter',
        param: '-f, --email-filter <items>',
        description: 'Filter commits by email. This is a comma separated list',
    },
    {
        optionName: 'commitEmail',
        param: '-e, --commit-email <value>',
        description: 'What email to commit as',
    },
];

module.exports = options;
