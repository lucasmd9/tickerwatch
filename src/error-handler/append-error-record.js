const c=$input.first().json;c.dirty=[{table:'Runs',key:'error_'+c.error_record.execution_id,value:{...c.error_record,status:'error'}}];c.operation='write';return [{json:c}];
