/**
 * various constants to be used with SBML object
 * creation etc
 */
var SBMLConstants = {};
SBMLConstants.defaults = {
                            'SIMPLECHEMICAL'        :{iHeight:40,iWidth:40},
                            'GENERICPROTEIN'        :{iHeight:40,iWidth:80},
                            'GENE'                  :{iHeight:40,iWidth:80},
                            'RNA'                   :{iHeight:40,iWidth:80},
                            'RECEPTOR'              :{iHeight:40,iWidth:60},
                            'PHENOTYPE'             :{iHeight:40,iWidth:80},
                            'PERTURBINGAGENT'       :{iHeight:40,iWidth:80},
                            'SOURCEORSINK'          :{iHeight:40,iWidth:40},
                            'LIGAND'                :{iHeight:40,iWidth:40},
                            'TRANSCRIPTIONFACTOR'   :{iHeight:40,iWidth:80},
                            'ENZYME'                :{iHeight:40,iWidth:80},
                            'COMPLEX'               :{iHeight:160,iWidth:130},
                            'RECTANGULAR'           :{iHeight:80,iWidth:160},
                            'CIRCULAR'              :{iHeight:80,iWidth:160},
                            //'REACTION'              :{iHeight:20,iWidth:20},
                            'GENERAL'               :{iHeight:20,iWidth:20},
                            'TRANSPORT'             :{iHeight:20,iWidth:20},
                            'TRANSCRIPTION'         :{iHeight:20,iWidth:20},
                            'TRANSLATION'           :{iHeight:20,iWidth:20},
                            'COMPLEXFORMATION'      :{iHeight:20,iWidth:20},
                            'COVALENTMODIFICATION'  :{iHeight:20,iWidth:20}
                        }
SBMLConstants.colorConstants = {
            'GENERAL'               :'rgb(0,0,0)',
            'TRANSPORT'             :'rgb(120,51,47)',
            'TRANSCRIPTION'         :'rgb(235,78,227)',
            'TRANSLATION'           :'rgb(70,116,163)',
            'COMPLEX FORMATION'     :'rgb(19,170,214)',
            'COVALENT MODIFICATION' :'rgb(254,148,6)',

}

SBMLConstants.objectDefaults = {
                                'edgeColor':{iRed: 0, iGreen: 0, iBlue: 0, iAlfa: 255}//equates to black color
                                }
