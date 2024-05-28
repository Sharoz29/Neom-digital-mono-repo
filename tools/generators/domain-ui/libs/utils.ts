export function underscoreToSentenseCase ( text: string ): string {
  return text
    ? String( text[ 0 ].toUpperCase() + text.substr( 1 ) )
      .split( '_' )
      .map( ( a ) => a[ 0 ].toUpperCase() + a.substr( 1 ) )
      .join( ' ' )
    : '';
}

export function dashToUnderscore ( text: string ): string {
  return text
    ? String( text )
      .split( '-' )
      .join( '_' )
    : '';
}
