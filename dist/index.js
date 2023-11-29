"use strict";
var InteractiveDiagram = /** @class */ (function () {
    /**
     * Creates an instance of InteractiveDiagram.
     *
     * @param contentDivId The id of the div that contains the content of the diagram
     * @param diagramBaseDivId The id of the div that contains the diagram base SVG
     * @param allDataSteps An array of strings that represent the data-step attribute of each step
     * @param previousControlId The id of the div that contains the previous button
     * @param nextControlId The id of the div that contains the next button
     */
    function InteractiveDiagram(contentDivId, diagramBaseDivId, allDataSteps, previousControlId, nextControlId) {
        var _this = this;
        this.currentStepIndex = 0;
        // set internal vars
        this.contentDiv = this.getDivFromId(contentDivId);
        this.diagramBaseDiv = this.getDivFromId(diagramBaseDivId);
        this.allSteps = this.getStepDivs(allDataSteps);
        // set controls
        this.previousControl = this.getDivFromId(previousControlId);
        this.nextControl = this.getDivFromId(nextControlId);
        this.previousControl.addEventListener('click', function (e) {
            e.preventDefault();
            _this.setStep(--_this.currentStepIndex);
        });
        this.nextControl.addEventListener('click', function (e) {
            e.preventDefault();
            _this.setStep(++_this.currentStepIndex);
        });
        // set initial step and get all the steps ready
        this.currentStep = this.allSteps[this.currentStepIndex];
        this.setStep();
    }
    /**
     * Sets the current step of the diagram and changes the visibility of all steps accordingly.
     *
     * @param index The index of the step to set, if not provided, the currentStepIndex will be used
     */
    InteractiveDiagram.prototype.setStep = function (index) {
        if (index) {
            if (index < 0)
                this.currentStepIndex = 0;
            else if (index > this.allSteps.length - 1)
                this.currentStepIndex = this.allSteps.length - 1;
            else
                this.currentStepIndex = index;
        }
        this.currentStep = this.allSteps[this.currentStepIndex];
        this.showCurrentStep();
    };
    /**
     * Shows the current step and hides all other steps.
     */
    InteractiveDiagram.prototype.showCurrentStep = function () {
        var _this = this;
        this.allSteps.forEach(function (step) {
            if (step === _this.currentStep) {
                step.style.display = 'block';
            }
            else {
                step.style.display = 'none';
            }
        });
    };
    /**
     * Provides an HTMLElement from an id.
     *
     * @param id The id of the div to get
     * @returns The HTMLElement that matches the provided id
     */
    InteractiveDiagram.prototype.getDivFromId = function (id) {
        var element = document.getElementById(id);
        if (element) {
            return element;
        }
        else {
            throw new Error("Element with id ".concat(id, " not found"));
        }
    };
    /**
     * Lets you get an array of HTMLElements that match the provided array of data-step attributes.
     *
     * @param steps An array of strings that represent the data-step attribute of each step
     * @returns An array of HTMLElements that match the provided data-step attributes
     */
    InteractiveDiagram.prototype.getStepDivs = function (steps) {
        var queriedStepDivs = steps.map(function (step) {
            var element = document.querySelector("[data-step=\"".concat(step, "\"]"));
            if (element) {
                return element;
            }
            else {
                throw new Error("Step ".concat(step, " not found"));
            }
        });
        return queriedStepDivs;
    };
    InteractiveDiagram.prototype.render = function () {
        return "Hello! I created a new instance of InteractiveDiagram. Here are the details:\n    contentDiv: ".concat(this.contentDiv.id, "\n    diagramBaseDiv: ").concat(this.diagramBaseDiv.id, "\n    currentStep: ").concat(this.currentStep.dataset.step, "\n    ");
    };
    return InteractiveDiagram;
}());
var githubFlow = new InteractiveDiagram('flow-content', 'scrollable-diagram', ['branch', 'commits', 'pr', 'code-review', 'deploy', 'merge'], 'previous', 'next');
// console.log(githubFlow.render())
