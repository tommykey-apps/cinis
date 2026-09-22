resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = var.project

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 2
        properties = {
          markdown = "# cinis operations dashboard\n**Domain:** ${var.domain} | **Region:** ${var.region} | **State:** s3://tommykeyapp-tfstate/burnnote/terraform.tfstate"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 2
        width  = 12
        height = 6
        properties = {
          title   = "Lambda — invocations / errors / throttles"
          region  = var.region
          view    = "timeSeries"
          stacked = false
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", aws_lambda_function.api.function_name, { stat = "Sum" }],
            [".", "Errors", ".", ".", { stat = "Sum", color = "#d13212" }],
            [".", "Throttles", ".", ".", { stat = "Sum", color = "#ff7f0e" }]
          ]
          period = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 2
        width  = 12
        height = 6
        properties = {
          title   = "Lambda — duration (p50 / p95 / p99)"
          region  = var.region
          view    = "timeSeries"
          stacked = false
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", aws_lambda_function.api.function_name, { stat = "p50", label = "p50" }],
            ["...", { stat = "p95", label = "p95" }],
            ["...", { stat = "p99", label = "p99" }]
          ]
          period = 300
          yAxis = {
            left = {
              label = "ms"
              min   = 0
            }
          }
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 8
        width  = 12
        height = 6
        properties = {
          title   = "API Gateway — request count & errors"
          region  = var.region
          view    = "timeSeries"
          stacked = false
          metrics = [
            ["AWS/ApiGateway", "Count", "ApiId", aws_apigatewayv2_api.api.id, { stat = "Sum" }],
            [".", "4xx", ".", ".", { stat = "Sum", color = "#ff7f0e" }],
            [".", "5xx", ".", ".", { stat = "Sum", color = "#d13212" }]
          ]
          period = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 8
        width  = 12
        height = 6
        properties = {
          title   = "API Gateway — integration latency"
          region  = var.region
          view    = "timeSeries"
          stacked = false
          metrics = [
            ["AWS/ApiGateway", "IntegrationLatency", "ApiId", aws_apigatewayv2_api.api.id, { stat = "p50", label = "p50" }],
            ["...", { stat = "p95", label = "p95" }],
            ["...", { stat = "p99", label = "p99" }]
          ]
          period = 300
          yAxis = {
            left = {
              label = "ms"
              min   = 0
            }
          }
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 14
        width  = 12
        height = 6
        properties = {
          title   = "DynamoDB — consumed capacity & throttles"
          region  = var.region
          view    = "timeSeries"
          stacked = false
          metrics = [
            ["AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", aws_dynamodb_table.notes.name, { stat = "Sum", label = "Read RCU" }],
            [".", "ConsumedWriteCapacityUnits", ".", ".", { stat = "Sum", label = "Write WCU" }],
            [".", "ReadThrottleEvents", ".", ".", { stat = "Sum", color = "#d13212" }],
            [".", "WriteThrottleEvents", ".", ".", { stat = "Sum", color = "#d13212" }]
          ]
          period = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 14
        width  = 12
        height = 6
        properties = {
          title   = "DynamoDB — user errors & latency"
          region  = var.region
          view    = "timeSeries"
          stacked = false
          metrics = [
            ["AWS/DynamoDB", "UserErrors", { stat = "Sum" }],
            ["AWS/DynamoDB", "SuccessfulRequestLatency", "TableName", aws_dynamodb_table.notes.name, "Operation", "PutItem", { stat = "Average", label = "PutItem p50" }],
            [".", ".", ".", ".", ".", "DeleteItem", { stat = "Average", label = "DeleteItem p50" }],
            [".", ".", ".", ".", ".", "GetItem", { stat = "Average", label = "GetItem p50" }]
          ]
          period = 300
          yAxis = {
            left = {
              label = "ms / count"
              min   = 0
            }
          }
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 20
        width  = 12
        height = 6
        properties = {
          title   = "CloudFront — requests & error rate (us-east-1)"
          region  = "us-east-1"
          view    = "timeSeries"
          stacked = false
          metrics = [
            ["AWS/CloudFront", "Requests", "DistributionId", aws_cloudfront_distribution.frontend.id, "Region", "Global", { stat = "Sum" }],
            [".", "4xxErrorRate", ".", ".", ".", ".", { stat = "Average", color = "#ff7f0e", yAxis = "right" }],
            [".", "5xxErrorRate", ".", ".", ".", ".", { stat = "Average", color = "#d13212", yAxis = "right" }]
          ]
          period = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 20
        width  = 12
        height = 6
        properties = {
          title   = "CloudFront — bytes downloaded (us-east-1)"
          region  = "us-east-1"
          view    = "timeSeries"
          stacked = false
          metrics = [
            ["AWS/CloudFront", "BytesDownloaded", "DistributionId", aws_cloudfront_distribution.frontend.id, "Region", "Global", { stat = "Sum" }]
          ]
          period = 300
        }
      },
      {
        type   = "log"
        x      = 0
        y      = 26
        width  = 24
        height = 6
        properties = {
          title  = "Lambda errors (recent)"
          region = var.region
          query  = "SOURCE '${aws_cloudwatch_log_group.lambda.name}' | fields @timestamp, @message | filter @message like /ERROR|Error|Exception/ | sort @timestamp desc | limit 50"
          view   = "table"
        }
      }
    ]
  })
}
