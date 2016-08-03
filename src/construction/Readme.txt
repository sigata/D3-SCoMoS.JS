Construction Module :
Features :
    1) Construction methods.
    2) Construction config setters and getters.
    3) setters and getters for various tools/shapes etc provieded by the library.
    4) Support for Undo Redo functionality.
Design Assumptions.
    IMP : this module  is very specific to the eskin web application, so that it shall work out of box with
        eskin web app. Also the care is taken to make library independent of construction module,
        so that library library can be built excluding construction feature as this feature will be not required
        by all the users.
