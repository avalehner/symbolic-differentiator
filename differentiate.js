//Write a symbolic differentiator for polynomial expressions of one variable.

//npm install prompts 
const prompts = require('prompts')

//functions 
const endDifferentiator = () => {
  console.log('You have ended symbolic differentator. Goodbye!')
  process.exit()
}

const getVariable = (polynomial) => {
  const variablesArr = polynomial.match(/[a-zA-Z]/g)  

  if(!variablesArr) {
    return {
      variable: null, 
      singleVariable: false
    }
  }

  const isSingleVariable = variablesArr.every(variable => variable === variablesArr[0])

  return {
    variable: variablesArr[0], 
    singleVariable: isSingleVariable 
  }
}

const getPolynomialTerms = (polynomial) => {
  polynomial = polynomial.replace(/\s/g, '') //finds white spaces and replaces with empty string 

  const terms = polynomial.split(/(?=[+\-])/) //?= positive look ahead 

  if(terms[0].startsWith('+')) {
    terms[0] = terms[0].slice(1)
  }

  return terms 
}

const getPolynomialOperatorsArr = (polynomial) => {
  return polynomial.match(/[+\-]/g)
}

const getCoefficientFromTerm = (term, variable) => {
  term = term.trim() //remove empty spaces from term 

  if(term.startsWith(variable)) return 1 
  if(term.startsWith('-' + variable)) return -1 

  const coefficient = term.match(/^-?\d+/) //pulls number from beginning of term, optional '-' sign (?) \d pulls all numbers
  return coefficient ? parseInt(coefficient[0]) : 1 //if coefficient exists turn into integer, if it does not return 1 (safety for edge cases)
}

const differentiate = (polynomial) => {
  const polynomialTerms = getPolynomialTerms(polynomial)
  const operators = getPolynomialOperatorsArr(polynomial)
  const variable = getVariable(polynomial).variable 

  //get exponents + coefficients 
  const exponentAndCoefficientArr = polynomialTerms.map((term) => {
    let exponent 

    if (term.includes('^')) {
      exponent = parseInt(term.split('^')[1]) //turns string into number 
    } else if (term.includes(variable)) {
      exponent = 1
    } else {
      exponent = 0 
    }
  
  //calculate differentiated coefficient 
  const coefficient = getCoefficientFromTerm(term, variable)

  return {
    differentiatedCoefficient: exponent * coefficient, 
    differentiatedExponent : exponent - 1  
  }})

  const derivativeArr = exponentAndCoefficientArr.map((term, index) => {
    //skip terms with negative exponents
    if(term.differentiatedExponent < 0) return undefined 

    let termString 
    if (term.differentiatedExponent > 1) {
      termString = `${term.differentiatedCoefficient}${variable}^${term.differentiatedExponent}`
    } else if (term.differentiatedExponent === 1) {
      termString = `${term.differentiatedCoefficient}${variable}`
    } else {
      termString = `${term.differentiatedCoefficient}`
    } 

    if (index === 0 || !operators) return termString
    return `${operators[index - 1]} ${termString}` 

  })

  //remove unneccesary terms
  const derivative = derivativeArr.filter((term)=>{
    return term !== undefined 
  }).join(' ')

  return derivative
}

const runDifferentiator = async () => {
  console.clear()
  //welcome message 
  await prompts ({
    type: 'text', 
    name: 'welcome', 
    message: 'Welcome to the symbolic differentiator! Press enter to begin'
  }, { onCancel: endDifferentiator })

  const polynomialInputResponse = await prompts({
    type: 'text', 
    name: 'polynomial', 
    message: 'Input a single variable polynomial to differentiate (use ^ to indicate exponents on variables): ', 
    validate: (polynomial) => {
      const variableObj = getVariable(polynomial)

      if (polynomial.trim() === '') {
        return 'Please enter a single variable polynomial. (eg: 9x^2 + x + 1)'
      }
    
      if (!variableObj.singleVariable) {
        return 'Please enter a single variable polynomial. (eg: 9x^2 + x + 1)'
      }

      if(polynomial.includes('^') && !polynomial.includes(variableObj.variable)) {
        return 'Please enter an exponent after your variable'
      }
      return true 
    } 
  }, { onCancel: endDifferentiator })

  await prompts({
    type: 'text', 
    name: 'confirm', 
    message: `You have entered ${polynomialInputResponse.polynomial}. Press enter to differentiate.`
  }, { onCancel: endDifferentiator })

    await prompts({
    type: 'text', 
    name: 'confirm', 
    message: `Derivative: ${differentiate(polynomialInputResponse.polynomial)}`
  }, { onCancel: endDifferentiator })

  const menu = await prompts({
    type: 'select', 
    name: 'repeat', 
    message: `Would you like to differentiate another single variable polynomial?`, 
    choices: [
      {title: 'Yes', value: 'yes'}, 
      {title: 'No', value: 'no'}
    ], 
    initial: 0
  }, { onCancel: endDifferentiator })

  if (menu.repeat === undefined || menu.repeat === 'no') {
    console.log('You have ended symbolic differentator. Goodbye!')
    process.exit(0)
  }
  
  if(menu.repeat === 'yes') {
    await runDifferentiator()
  }

}

runDifferentiator()
