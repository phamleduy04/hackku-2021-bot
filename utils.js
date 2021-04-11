module.exports = {
    dep: function(num) {
        if (!num) return 0;
        const pattern = /\B(?=(\d{3})+(?!\d))/g;
        return num.toString().replace(pattern, ',');
    },
};