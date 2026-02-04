//npm install prompts 
const prompts = require('prompts')

//functions 
const endDifferentiator = () => {
  console.log('You have ended symbolic differentiator. Goodbye!')
  process.exit()
}

const getVariable = (polynomial) => {
  const variablesArr = polynomial.match(/[a-zA-Z]/g) //extracts variable 

  if(!variablesArr) {
    return {
      variable: null, 
      singleVariable: true
    }
  }

const isSingleVariable = variablesArr.every(variable => variable === variablesArr[0]) //checks that there is only one variable present in inputted function

  return {
    variable: variablesArr[0], 
    singleVariable: isSingleVariable 
  }
}

const getPolynomialTerms = (polynomial) => {
  polynomial = polynomial.replace(/\s/g, '') //finds white spaces and replaces with empty string 
  polynomial = polynomial.replace(/^\+/,'') //remove leading + 

  const terms = polynomial.split(/(?=[+\-])/) //?= positive look ahead 
  return terms 
}

const getCoefficientFromTerm = (term, variable) => {
  term = term.trim() //remove empty spaces from term 

  if(term.startsWith(variable)) return 1 
  if(term.startsWith('-' + variable)) return -1 

  const coefficient = term.match(/^[-\+]?\d+/) //pulls number from beginning of term, optional - or + sign; ?\d pulls all numbers
  return coefficient ? parseInt(coefficient[0]) : 1 //if coefficient exists turn into integer (removes +)
}

const differentiate = (polynomial) => {
  const polynomialTerms = getPolynomialTerms(polynomial)
  const variableObj = getVariable(polynomial)
  const variable = variableObj.variable 

  if (!variable) {
    return '0'
  }

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
  
  const coefficient = getCoefficientFromTerm(term, variable)

  //calculate differentiated coefficient 
  return {
    differentiatedCoefficient: exponent * coefficient, 
    differentiatedExponent : exponent - 1  
  }})

  const derivativeArr = exponentAndCoefficientArr.map((term, index) => {    
    //skip terms with negative exponents
    if(term.differentiatedExponent < 0) return undefined 

    //skip terms with coefficient of 0 
    if(term.differentiatedCoefficient === 0) return undefined

    let termString 
    if (term.differentiatedExponent > 1) {
      termString = `${term.differentiatedCoefficient}${variable}^${term.differentiatedExponent}`
    } else if (term.differentiatedExponent === 1) {
      termString = `${term.differentiatedCoefficient}${variable}`
    } else {
      termString = `${term.differentiatedCoefficient}`
    } 

    if (termString.startsWith('-')) {
      const positiveVersion = termString.slice(1)
      return `- ${positiveVersion}`
    } else { 
      return `+ ${termString}` 
    }
  })

  //remove undefined terms
  const filteredDerivativeArr = derivativeArr.filter((term)=>term !== undefined)

  if (filteredDerivativeArr.length === 0) return '0'

  //remove leading + if on first term 
  if (filteredDerivativeArr[0].startsWith('+ ')) {
    filteredDerivativeArr[0] = filteredDerivativeArr[0].slice(2)
  }

  const derivative = filteredDerivativeArr.join(' ')

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
        return 'Please enter a single variable polynomial. (ex: 9x^2 + x + 1)'      
      }

      if (!/^[a-zA-Z0-9+\-^\s]+$/.test(polynomial)) {
        return 'Please enter only letters, numbers, +, -, and ^ (for exponents)'
      }

      if (!variableObj.singleVariable) {
        return 'Please enter a single variable polynomial. (ex: 9x^2 + x + 1)'
      }

      if (/\^(?!\d+)|(^|[^a-zA-Z])\^/.test(polynomial)) {
        return 'Please format your exponent correctly, exponents must follow variables (ex: x^2; 3x^5)'
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
    endDifferentiator()
  }
  
  if(menu.repeat === 'yes') {
    await runDifferentiator()
  }
}

runDifferentiator()
