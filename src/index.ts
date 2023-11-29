class InteractiveDiagram {
  private contentDiv: HTMLElement
  private diagramBaseDiv: HTMLElement

  private currentStep: HTMLElement
  private currentStepIndex: number = 0
  private allSteps: HTMLElement[]

  private previousControl: HTMLElement
  private nextControl: HTMLElement

  /**
   * Creates an instance of InteractiveDiagram.
   *
   * @param contentDivId The id of the div that contains the content of the diagram
   * @param diagramBaseDivId The id of the div that contains the diagram base SVG
   * @param allDataSteps An array of strings that represent the data-step attribute of each step
   * @param previousControlId The id of the div that contains the previous button
   * @param nextControlId The id of the div that contains the next button
   */
  constructor(
    contentDivId: string,
    diagramBaseDivId: string,
    allDataSteps: string[],
    previousControlId: string,
    nextControlId: string
  ) {
    // set internal vars
    this.contentDiv = this.getDivFromId(contentDivId)
    this.diagramBaseDiv = this.getDivFromId(diagramBaseDivId)
    this.allSteps = this.getStepDivs(allDataSteps)

    // set controls
    this.previousControl = this.getDivFromId(previousControlId)
    this.nextControl = this.getDivFromId(nextControlId)

    this.previousControl.addEventListener('click', (e) => {
      e.preventDefault()
      this.setStep(--this.currentStepIndex)
    })

    this.nextControl.addEventListener('click', (e) => {
      e.preventDefault()
      this.setStep(++this.currentStepIndex)
    })

    // set initial step and get all the steps ready
    this.currentStep = this.allSteps[this.currentStepIndex]
    this.setStep()
  }

  /**
   * Sets the current step of the diagram and changes the visibility of all steps accordingly.
   *
   * @param index The index of the step to set, if not provided, the currentStepIndex will be used
   */
  private setStep(index?: number) {
    if (index) {
      if (index < 0) this.currentStepIndex = 0
      else if (index > this.allSteps.length - 1)
        this.currentStepIndex = this.allSteps.length - 1
      else this.currentStepIndex = index
    }

    this.currentStep = this.allSteps[this.currentStepIndex]
    this.showCurrentStep()
  }

  /**
   * Shows the current step and hides all other steps.
   */
  private showCurrentStep() {
    this.allSteps.forEach((step) => {
      if (step === this.currentStep) {
        step.style.display = 'block'
      } else {
        step.style.display = 'none'
      }
    })
  }

  /**
   * Provides an HTMLElement from an id.
   *
   * @param id The id of the div to get
   * @returns The HTMLElement that matches the provided id
   */
  private getDivFromId(id: string) {
    let element = document.getElementById(id)
    if (element) {
      return element
    } else {
      throw new Error(`Element with id ${id} not found`)
    }
  }

  /**
   * Lets you get an array of HTMLElements that match the provided array of data-step attributes.
   *
   * @param steps An array of strings that represent the data-step attribute of each step
   * @returns An array of HTMLElements that match the provided data-step attributes
   */
  private getStepDivs(steps: string[]) {
    let queriedStepDivs: HTMLElement[] = steps.map((step) => {
      let element = document.querySelector(`[data-step="${step}"]`)
      if (element) {
        return element as HTMLElement
      } else {
        throw new Error(`Step ${step} not found`)
      }
    })

    return queriedStepDivs
  }

  render() {
    return `Hello! I created a new instance of InteractiveDiagram. Here are the details:
    contentDiv: ${this.contentDiv.id}
    diagramBaseDiv: ${this.diagramBaseDiv.id}
    currentStep: ${this.currentStep.dataset.step}
    `
  }
}

let githubFlow = new InteractiveDiagram(
  'flow-content',
  'scrollable-diagram',
  ['branch', 'commits', 'pr', 'code-review', 'deploy', 'merge'],
  'previous',
  'next'
)

// console.log(githubFlow.render())
