console.log('Executing neonatal setup script for model <neo> ')

// instantiating new model with model definition stored in normal_neonate.json
neo = newModel("./ModelDefinitions/normal_neonate.json")

console.log('Model <neo> initializing. Please wait')
// wait for a second to make sure the model is loaded
setTimeout(() => {
    // import and inject the <neonate> datalogger configuration file into the model
    neo.importLoggers(neo, "./Loggers/neonate_loggers.json")

    // import and inject the <neonate> interventions configuration file into the model
    neo.importInterventions(neo, "./Interventions/neonate_interventions.json")

    console.log('Dataloggers and interventions loaded into <neo>')
    console.log('Ready.')
}, 1000)

