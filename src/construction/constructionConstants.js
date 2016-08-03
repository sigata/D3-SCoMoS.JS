/**
 * Will hold all the constants regarding the construction functionality.
 * make sure contants from this file are exclusively used inside the construction module only
 * as this file is part of conditional build.
 */

var constructionConstants = {};

constructionConstants.tools = {
    species:['SIMPLECHEMICAL','GENERICPROTEIN','GENE','RNA','RECEPTOR',
            'PHENOTYPE','PERTURBINGAGENT','SOURCEORSINK','LIGAND',
            'TRANSCRIPTIONFACTOR','ENZYME','COMPLEX'],
    compartment:['RECTANGULAR','CIRCULAR'],
    covalent:['PHOSPHORYLATION','LIPIDATION','UBIQUITINATION','GLYCOSYLATION','ACETYLATION','OTHER'],
    reaction:['GENERAL','TRANSPORT','TRANSCRIPTION','TRANSLATION','COMPLEXFORMATION','COVALENTMODIFICATION','ADDPRODUCT','ADDREACTANT','ACTIVATOR','INHIBITOR'],
}
constructionConstants.covalentToolMappings = {'PHOSPHORYLATION':'P','LIPIDATION':'L','UBIQUITINATION':'U',
                                              'GLYCOSYLATION':'G','ACETYLATION':'A','OTHER':'O'};

constructionConstants.toolToTargetMapping = {
        'GENERAL'           :{source:['Species'],target:['Species']},
        'TRANSPORT'         :{source:['Species'],target:['Species']},
        'TRANSCRIPTION'     :{source:['Species'],target:['Species']},
        'TRANSLATION'       :{source:['Species'],target:['Species']},
        'COMPLEXFORMATION'  :{source:['Species'],target:['Species']},
        'COVALENTMODIFICATION':{source:['Species'],target:['Species']},

        'ADDPRODUCT'    :{source:['Reaction'],target:['Species']},
        'ADDREACTANT'   :{source:['Species'],target:['Reaction']},
        'ACTIVATOR'     :{source:['Species'],target:['Reaction']},
        'INHIBITOR'     :{source:['Species'],target:['Reaction']},
}
var typeMappings = {
    //--species type mapping
    "Simple Chemical"    :"SIMPLECHEMICAL",
    "Generic Protein"    :"GENERICPROTEIN",
    "DNA (Gene)"         :"GENE",
    "RNA"               :"RNA",
    "Receptor"          :"RECEPTOR",
    "Phenotype"         :"PHENOTYPE",
    "Perturbing Agent"   :"PERTURBINGAGENT",
    "Source/Sink"       :"SOURCEORSINK",
    "Ligand"            :"LIGAND",
    "Transcription Factor":"TRANSCRIPTIONFACTOR",
    "Enzyme"            :"ENZYME",
    "Complex"           :"COMPLEX",
    "REACTION"          :"REACTION",
    "Invalid Molecule(s)":"GENE",
    //--- compartment type mappings
    "Rectangular"       :"RECTANGULAR",
    "Circular"          :"CIRCULAR",
    //-- following are reaction type mappings
    "General"           :"GENERAL",
    "Transport"         :"TRANSPORT",
    "Transcription"     :"TRANSCRIPTION",
    "Translation"       :"TRANSLATION",
    "Complex Formation" :"COMPLEXFORMATION",
    "Covalent Modification" : "COVALENTMODIFICATION",
}

var groupMapping ={
    'Group 1':['Generic Protein','DNA (Gene)','RNA','Receptor','Transcription Factor','Enzyme'],
    'Group 2':['Simple Chemical','Phenotype','Perturbing Agent','Source/Sink','Ligand']
}
function getMappedGroupFromStype(sType){
    if(groupMapping['Group 1'].indexOf(sType) != -1) return 'Group 1';
    return 'Group 2';
}
function getMappedStypeFromTool(symbolVal){
    var typeKeys = d3.keys(typeMappings);
    for(var key in typeKeys){
        if(typeMappings[typeKeys[key]] === symbolVal)
            return typeKeys[key];
    }
}

function verifytoolSource(toolName,entityType){
    var toolMapping = constructionConstants.toolToTargetMapping[toolName];
    if(toolMapping){
        return toolMapping.source.indexOf(entityType) != -1;
    }
    else{
        __logger.warn('Invalid ToolType'+ toolName+' specified in toolMappings')
        return false;
    }
}

function verifytoolTarget(toolName,entityType){
    var toolMapping = constructionConstants.toolToTargetMapping[toolName];
    if(toolMapping){
        return toolMapping.target.indexOf(entityType) != -1;
    }
    else{
        __logger.warn('Invalid ToolType'+ toolName+' specified in toolMappings')
        return false;
    }
}
