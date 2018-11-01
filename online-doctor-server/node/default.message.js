const template = require('./template');

module.exports = {

    getInformationSafeMessage: function (from, to) {
        return {
            from: from,
            to: to,
            template: template.TEMPLATE_1,
            createdDate: new Date(),
            shortMessage: 'Your detail is safe'
        };
    },

    getPatientTypeSelectionMessage: function (from, to) {
        return {
            from: from,
            to: to,
            template: template.TEMPLATE_2,
            createdDate: new Date(),
            shortMessage: 'Please select the answer'
        };
    }


}