module.exports = (transition) => {
    const error = {}

    if (!transition.amount) {
        error.amount = 'Please Provide you amount'
    }
    if (!transition.type) {
        error.type = 'Please Provide you type'
    }else if(transition.type !== 'income' && transition.type !==  'expense'){
        error.type = "Transition type must be 'income' or 'expense'"
    }
    return{
        error,
        isValid: Object.keys(error).length === 0
    }
}
