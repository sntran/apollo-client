import { GraphQLError } from 'graphql';

  // XXX some duck typing here because for some reason new ApolloError is not instanceof ApolloError
  export function isApolloError(err: Error): err is ApolloError {
    return err.hasOwnProperty('graphQLErrors');
  }

  // Sets the error message on this error according to the
  // the GraphQL and network errors that are present.
  // If the error message has already been set through the
  // constructor or otherwise, this function is a nop.
  const generateErrorMessage = (err: ApolloError) => {


    let message = '';
    // If we have GraphQL errors present, add that to the error message.
    if (Array.isArray(err.graphQLErrors) && err.graphQLErrors.length !== 0) {
      err.graphQLErrors.forEach((graphQLError: GraphQLError) => {
        message += 'GraphQL error: ' + graphQLError.message + '\n';
      });
    }

    if (err.networkError) {
      message += 'Network error: ' + err.networkError.message + '\n';
    }

    // strip newline from the end of the message
    message = message.replace(/\n$/, '');
    return message;
  };

export class ApolloError extends Error {
  public message: string;
  public graphQLErrors: GraphQLError[];
  public networkError: Error;

  // An object that can be used to provide some additional information
  // about an error, e.g. specifying the type of error this is. Used
  // internally within Apollo Client.
  public extraInfo: any;

  // Constructs an instance of ApolloError given a GraphQLError
  // or a network error. Note that one of these has to be a valid
  // value or the constructed error will be meaningless.
  constructor({
    graphQLErrors,
    networkError,
    errorMessage,
    extraInfo,
  }: {
    graphQLErrors?: GraphQLError[],
    networkError?: Error,
    errorMessage?: string,
    extraInfo?: any,
  }) {
    super(errorMessage);
    this.graphQLErrors = graphQLErrors;
    this.networkError = networkError;

    // set up the stack trace
    this.stack = new Error().stack;

    if (!errorMessage) {
      this.message = generateErrorMessage(this);
    } else {
      this.message = errorMessage;
    }

    this.extraInfo = extraInfo;
  }

}
