export default text => {
    return text.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&');
};

