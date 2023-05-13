import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';


type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

interface CreateAccountFormData {
  firstName: string;
  lastName: string;
  age: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  password: string;
  code: string;
}

interface MultiStepForm {
  activeStepIndex: number;
  activeSubStepIndex: number;
  step: React.ReactElement;
  steps: Array<Array<React.ReactElement>>;
  isFirstStep: boolean;
  isLastStep: boolean;
  next(): void;
  back(): void;
  goTo(index: number): void;
  formData: CreateAccountFormData;
  updateFormData(fields: Partial<CreateAccountFormData>): void;
  childFormRef: React.RefObject<HTMLFormElement>;
}

interface UseMultiStepForm {
  steps: Array<Array<React.ReactElement>>;
}

enum Types  {
  next = "NEXT",
  prev = "PREV",
  goto = 'GOTO',
  updateFormData = 'UPDATE_FORM_DATA'
}

type FormActionPayload = {
  [Types.next] : undefined,
  [Types.prev] : undefined,
  [Types.goto] : {
    index: number
  },
  [Types.updateFormData] : {fields: Partial<CreateAccountFormData>},
}

type MultiStepFormActions = ActionMap<FormActionPayload>[keyof ActionMap<FormActionPayload>];

function multiStepFormReducer(state: MultiStepForm, action: MultiStepFormActions): MultiStepForm {
  switch (action.type) {
    case 'NEXT': {
      const { activeStepIndex, activeSubStepIndex, steps } = state;
      const nextSubStepIndex = activeSubStepIndex + 1;

      if (steps[activeStepIndex].length > 1) {
        if (nextSubStepIndex === steps[activeStepIndex].length) {
          return {
            ...state,
            activeStepIndex: activeStepIndex + 1,
            activeSubStepIndex: 0,
          };
        }
        return {
          ...state,
          activeSubStepIndex: nextSubStepIndex,
        };
      }
      return {
        ...state,
        activeStepIndex: activeStepIndex + 1,
        activeSubStepIndex: 0,
      };
    }

    case 'PREV': {
      const { activeStepIndex } = state;

      return {
        ...state,
        activeStepIndex: activeStepIndex - 1,
        activeSubStepIndex: 0,
      };
    }

    case 'GOTO': {
      const { index } = action;

      return {
        ...state,
        activeStepIndex: index,
        activeSubStepIndex: 0,
      };
    }

    case 'UPDATE_FORM_DATA': {
      const { fields } = action;

      return {
        ...state,
        formData: {
          ...state.formData,
          ...fields,
        },
      };
    }

    default: {
      throw new Error(`Invalid action type: ${action.type}`);
    }
  }
}

const MultiStepFormContext = createContext<MultiStepForm | null>(null);

const useMultiStepForm = (props: UseMultiStepForm): MultiStepForm => {
  const childFormRef = React.useRef<HTMLFormElement>(null);

  const initialFormData: CreateAccountFormData = {
    firstName: '',
    lastName: '',
    age: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    email: '',
    password: '',
    code: '',
  };

  const { steps: initialSteps } = props;

  const [state, dispatch] = useReducer(multiStepFormReducer, {
    activeStepIndex: 0,
    activeSubStepIndex: 0,
    formData: initialFormData,
  });

  const steps = useMemo(() => initialSteps, [initialSteps]);

  const next = useCallback(() => {
    dispatch(Types.next);
  }, []);

  const back = useCallback(() => {
    dispatch(Types.prev);
  }, []);

  const goTo = useCallback((index: number) => {
    dispatch(Types.goto, {index});
  }, []);

  const updateFormData = useCallback((fields: Partial<CreateAccountFormData>) => {
    dispatch(Types.updateFormData, {fields});
  }, []);

  return {
    activeStepIndex,
    activeSubStepIndex,
    step: steps[activeStepIndex][activeSubStepIndex],
    steps,
    isFirstStep: activeStepIndex === 0,
    isLastStep: activeStepIndex === steps.length - 1,
    next,
    back,
    goTo,
    formData,
    updateFormData,
    childFormRef,
  };
};

const MultiStepFormProvider = ({
  children,
  steps,
}: {
  children: React.ReactNode;
  steps: Array<Array<React.ReactElement>>;
}): JSX.Element => {
  const multiStepForm = useMultiStepForm({ steps });

  return (
    <MultiStepFormContext.Provider value={multiStepForm}>{children}</MultiStepFormContext.Provider>
  );
};

function useMultiStepFormContext(): MultiStepForm {
  const context = useContext(MultiStepFormContext);

  if (!context) {
    throw new Error('useMultiStepFormContext must be used within a MultiStepFormProvider');
  }

  return context;
}

export { MultiStepFormProvider, useMultiStepFormContext };
