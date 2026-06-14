from executors.trigger import execute as trigger_execute
from executors.llm import execute as llm_execute
from executors.filter import execute as filter_execute
from executors.http_request import execute as http_request_execute
from executors.transform import execute as transform_execute
from executors.webhook import execute as webhook_execute

EXECUTORS = {
    "trigger": trigger_execute,
    "llm": llm_execute,
    "filter": filter_execute,
    "httpRequest": http_request_execute,
    "transform": transform_execute,
    "webhook": webhook_execute,
}
