class Step {
  public readonly name: string
  private active: boolean
  private contentContainer: HTMLElement
  public images: HTMLElement[]
  public annotation: Annotation

  /**
   * Creates an instance of Step.
   *
   * @param stepId The name of the step
   * @param content The div that contains the content of the step
   * @param image The image or images associated with the step
   * @param annotation The annotation that is associated with the step
   */
  constructor(
    stepId: string,
    content: HTMLElement,
    image: HTMLElement | NodeListOf<HTMLElement> | null,
    annotation: Annotation
  ) {
    this.name = stepId
    this.contentContainer = content
    this.active = false
    this.annotation = annotation
    this.images = []

    if (image) {
      if (image instanceof HTMLElement) {
        // Handle list of images
        this.images.push(image)
      } else {
        // Handle single image
        this.images = Array.from(image)
      }
    } else throw new Error('No image found')
  }

  /**
   * Shows the content div of the step, marks each associated image active
   */
  public show() {
    this.contentContainer.style.display = 'block'
    this.contentContainer.classList.add('active')

    this.annotation.activate()
    this.images.forEach((image) => {
      image.classList.add('active')
    })
    this.active = true
  }

  /**
   * Hides the content div of the step, marks each associated image inactive
   */
  public hide() {
    this.contentContainer.style.display = 'none'

    this.annotation.deactivate()
    this.images.forEach((image) => {
      image.classList.remove('active')
    })
    this.active = false
  }

  /**
   * Returns the active state of the step
   */
  public isActive() {
    return this.active
  }
}

interface Placement {
  top: number
  left: number
  height: number
  width: number
  BOTTOM: number
}

class Annotation {
  private COLORS = {
    DASH_COLOR: '#d4d4d4',
    ACTIVE_COLOR: '#932D70',
    INACTIVE_COLOR: '#4183c4',
  }

  private placement: Placement

  private paper: SVGElement

  public readonly name: string

  private extender: SVGLineElement
  public readonly target: SVGElement
  private source: HTMLElement

  private active = false

  constructor(
    name: string,
    paper: SVGElement,
    source: HTMLElement,
    placement: { [key: string]: number }
  ) {
    this.name = name
    this.paper = paper

    this.placement = {
      top: placement.top,
      left: placement.left,
      height: placement.height,
      width: placement.width,
      BOTTOM: 266,
    }

    this.target = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'g'
    ) as SVGElement

    this.source = source

    this.extender = this.initLines()

    this.target = this.createCircle(
      this.placement.left + 30,
      this.placement.top + this.placement.height,
      7,
      {
        fill: this.COLORS.INACTIVE_COLOR,
      }
    )

    this.paper.appendChild(this.target)
    // Create the foreignObject element
    const foreignObject = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'foreignObject'
    )
    console.log(`placing ${this.name} at ${this.placement.top}`)
    foreignObject.setAttribute('x', this.placement.left.toString())
    foreignObject.setAttribute('y', this.placement.top.toString())
    foreignObject.setAttribute('width', '100')
    foreignObject.setAttribute('height', '100')

    // Append the div to the foreignObject, and the foreignObject to the SVG
    foreignObject.appendChild(this.source) // this.paper.appendChild(this.source)
    paper.appendChild(foreignObject)
  }

  private initLines() {
    let line = this.createLine(
      this.placement.left + 30,
      this.placement.top,
      this.placement.left + 30,
      this.placement.top + this.placement.height
    )
    this.paper.appendChild(line)
    return line
  }

  activate() {
    console.log("Activatin'")
    this.target.setAttribute('fill', this.COLORS.ACTIVE_COLOR)
    this.extender.setAttribute('stroke', this.COLORS.ACTIVE_COLOR)
    this.extender.setAttribute('stroke-dasharray', 'none')
  }

  deactivate() {
    console.log("Activatin'")
    this.target.setAttribute('fill', this.COLORS.INACTIVE_COLOR)
    this.extender.setAttribute('stroke', this.COLORS.DASH_COLOR)
    this.extender.setAttribute('stroke-dasharray', '3')
  }

  private createLine(x1: number, y1: number, x2: number, y2: number) {
    let line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', x1.toString())
    line.setAttribute('y1', y1.toString())
    line.setAttribute('x2', x2.toString())
    line.setAttribute('y2', y2.toString())
    line.setAttribute('stroke', this.COLORS.DASH_COLOR)
    line.setAttribute('stroke-width', '1')
    line.setAttribute('stroke-dasharray', '3')

    return line
  }

  private createCircle(
    x: number,
    y: number,
    r: number,
    attributes: { [key: string]: string }
  ) {
    let circle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle'
    )
    circle.setAttribute('cx', x.toString())
    circle.setAttribute('cy', y.toString())
    circle.setAttribute('r', r.toString())

    for (let key in attributes) {
      circle.setAttribute(key, attributes[key])
    }

    return circle
  }
}

class InteractiveDiagram {
  private contentDiv: HTMLElement
  private diagramBaseSVG: SVGElement

  private currentStep: Step
  // private currentStepIndex: number = 0
  private allSteps: Step[]

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
    steps: { name: string; placement: { [key: string]: number } }[],
    // allDataSteps: string[],
    previousControlId: string,
    nextControlId: string
  ) {
    // set internal vars
    this.contentDiv = this.getElementFromId(contentDivId)

    const element = this.getElementFromId('js-features-branch-diagram-svg')
    if (element instanceof SVGElement) {
      this.diagramBaseSVG = element
    } else {
      throw new Error('Element is not an SVGElement')
    }

    this.allSteps = []
    steps.forEach((step) => {
      this.allSteps.push(
        new Step(
          step.name,
          this.getStepDiv(step.name),
          document.querySelectorAll(`[data-diagram-step="${step.name}"]`),
          new Annotation(
            step.name,
            this.diagramBaseSVG,
            document.querySelector(`[data-diagram-step="${step.name}"]`)!,
            step.placement
          )
        )
      )
    })

    // set controls
    this.previousControl = this.getElementFromId(previousControlId)
    this.nextControl = this.getElementFromId(nextControlId)

    this.previousControl.addEventListener('click', (e) => {
      e.preventDefault()
      // set the step to the index of the next Step object in allSteps[]
      this.setPreviousStep()
    })

    this.nextControl.addEventListener('click', (e) => {
      e.preventDefault()
      this.setNextStep()

      // find the id of the next step in steps[]
    })

    // set initial step and get all the steps ready
    // this.currentStep = this.allSteps[0]
    // TODO programmatically set to index0
    this.currentStep = this.allSteps[0]
    this.setStep('branch')

    // let annotations = [
    //   new Annotation('branch', this.diagramBaseSVG, {
    //     top: 20,
    //     left: 88,
    //     height: 207,
    //   }),
    //   new Annotation('commits', this.diagramBaseSVG, {
    //     top: 140,
    //     left: 289,
    //     height: 86,
    //     width: 113,
    //   }),
    //   new Annotation('pr', this.diagramBaseSVG, {
    //     top: 137,
    //     left: 423,
    //     height: 89,
    //   }),
    //   new Annotation('code-review', this.diagramBaseSVG, {
    //     top: 140,
    //     left: 550,
    //     height: 86,
    //     width: 145,
    //   }),
    //   new Annotation('deploy', this.diagramBaseSVG, {
    //     top: 137,
    //     left: 688,
    //     height: 89,
    //   }),
    //   new Annotation('merge', this.diagramBaseSVG, {
    //     top: 20,
    //     left: 840,
    //     height: 207,
    //   }),
    // ]

    this.allSteps.forEach((step) => {
      step.annotation.target.addEventListener('click', (e) => {
        e.preventDefault()
        console.log(`clicked on annotation ${step.name}`)
        this.setStep(step.name)
      })
      step.images.forEach((image) => {
        image.addEventListener('click', (e) => {
          e.preventDefault()
          console.log(`clicked on annotation ${step.name}`)
          this.setStep(step.name)
        })
      })
    })

    // annotations.forEach((annotation) => {
    //   annotation.target.addEventListener('click', (e) => {
    //     e.preventDefault()
    //     console.log(`clicked on annotation ${annotation.name}`)
    //     this.setStep(annotation.name)
    //   })
    // })

    // var diagramIcons = document.querySelectorAll(
    //   '.diagram-icon, .diagram-icon-small'
    // )
    // diagramIcons.forEach((icon) => {
    //   icon.addEventListener('click', (e) => {
    //     let step = icon.getAttribute('data-diagram-step')
    //     console.log(`clicked on ${step}`)
    //     if (step !== null) {
    //       this.setStep(step)
    //     } else {
    //       throw new Error(
    //         `data-diagram-step attribute doesn't exist for ${icon}`
    //       )
    //     }

    // changePanel(document.querySelector('.js-panel-content-' + step))
    // changeAnnotation(annotations, step)
    // })
    // })
  }

  private setNextStep() {
    let currentStepIndex = this.allSteps.findIndex(
      (step) => step.name === this.currentStep.name
    )
    this.setStep(undefined, currentStepIndex + 1)
  }
  private setPreviousStep() {
    // console.log('starting prev step calc')
    let currentStepIndex = this.allSteps.findIndex(
      (step) => step.name === this.currentStep.name
    )
    // console.log(
    //   `currentStepIndex is ${currentStepIndex}, figuring out what's prev`
    // )
    this.setStep(undefined, currentStepIndex - 1)
  }
  /**
   * Sets the current step of the diagram and changes the visibility of all steps accordingly.
   *
   * @param index The index of the step to set, if not provided, the currentStepIndex will be used
   */
  private setStep(id?: string, index?: number) {
    console.log(`looking to set the step to ${id} or ${index}`)
    if (index !== undefined) {
      index = Math.max(0, Math.min(index, this.allSteps.length - 1))
      this.currentStep = this.allSteps[index]
    } else if (id) {
      this.currentStep = this.allSteps.find((step) => step.name === id)!
    }
    console.log(
      `after calc bounds, step we want to show is ${this.currentStep.name}`
    )
    this.showCurrentStep()
  }

  /**
   * Shows the current step and hides all other steps.
   */
  private showCurrentStep() {
    console.log(`showing step ${this.currentStep.name}`)
    this.allSteps.forEach((step) => {
      if (step === this.currentStep) {
        step.show()
      } else {
        step.hide()
      }
    })
  }

  /**
   * Provides an HTMLElement from an id.
   *
   * @param id The id of the div to get
   * @returns The HTMLElement that matches the provided id
   */
  private getElementFromId(id: string) {
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
  private getStepDiv(step: string) {
    let element = document.querySelector(`[data-step="${step}"]`)
    if (element) {
      return element as HTMLElement
    } else {
      throw new Error(`Step ${step} not found`)
    }
  }

  render() {
    return `Hello! I created a new instance of InteractiveDiagram. Here are the details:
    contentDiv: ${this.contentDiv.id}
    diagramBaseSVG: ${this.diagramBaseSVG}
    currentStep: ${this.currentStep.name}
    `
  }
}

let githubFlow = new InteractiveDiagram(
  'flow-content',
  'scrollable-diagram',
  // Each step should actually contain (maybe a Step)
  // - an id of the div that contains the step content
  // - the SVG that illustrates the step
  // - a position to target the annotation (x,y)
  [
    { name: 'branch', placement: { top: 10, left: 48, height: 207 } },
    {
      name: 'commits',
      placement: { top: 140, left: 289, height: 86, width: 113 },
    },
    { name: 'pr', placement: { top: 137, left: 423, height: 89 } },
    {
      name: 'code-review',
      placement: { top: 140, left: 550, height: 86, width: 145 },
    },
    { name: 'deploy', placement: { top: 137, left: 688, height: 89 } },
    { name: 'merge', placement: { top: 20, left: 840, height: 207 } },
  ],
  // ['branch', 'commits', 'pr', 'code-review', 'deploy', 'merge'],
  'previous',
  'next'
)

console.log(githubFlow.render())
