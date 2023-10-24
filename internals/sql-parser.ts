export type ParsedSqlQuery = {
    columns: string[];
    table: string;
    where: Record<string, string>;
}

export class SqlParser {
    static parse(rawSqlQuery: string) {
      const sqlQuery = rawSqlQuery.split('\n').map((line) => line.split('--')[0]).join(' ');
      console.log(sqlQuery);
      const regex = /SELECT\s+(?<columns>.+)\s+FROM\s+(?<table>.+)\s+WHERE\s+(?<where>.+);/g;
      console.log(regex);
      const match = regex.exec(sqlQuery) as unknown as { groups: { columns: string, table: string, where: string } }
      console.log(match);
      if (match === null || match === undefined) {
          throw new Error('Invalid SQL query');
      }
      console.log(match.groups);
      const { columns, table, where } = match.groups;
      const columnsArr = columns.split(',').map((c: string) => c.trim());
      const whereArr = where.split('AND').map((c: string) => c.trim());
      const whereObj = whereArr.reduce((acc, curr) => {
          const [key, value] = curr.split('=');
          acc[key.trim()] = value.trim();
          return acc;
      }, {} as Record<string, string>);
      return { columns: columnsArr, table: table.trim(), where: whereObj };
    }
}