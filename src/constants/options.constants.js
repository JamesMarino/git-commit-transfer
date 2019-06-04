const options = [
    {
        optionName: 'inputDirectory',
        param: '-i, --input-directory <inputdirectory>',
        description: 'Directory containing directories of git repositories',
    },
    {
        optionName: 'outputDirectory',
        param: '-o, --output-directory <outputdirectory>',
        description: 'Directory of the output repository',
    },
    {
        optionName: 'repoName',
        param: '-o, --repo-name <reponame>',
        description: 'Name of the new repository to create',
    },
    {
        optionName: 'emailFilter',
        param: '-o, --email-filter <reponame>',
        description: 'Filter commits by email',
    },
];

module.exports = options;
