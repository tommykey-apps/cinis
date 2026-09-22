variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "project" {
  description = "Project name"
  type        = string
  default     = "burnnote"
}

variable "domain" {
  description = "Public domain"
  type        = string
  default     = "cinis.tommykeyapp.com"
}

variable "bref_layer_arn" {
  description = "Bref v3 arm-php-84 unified Lambda layer ARN (ap-northeast-1). Runtime mode (fpm/function/console) is controlled via BREF_RUNTIME env var."
  type        = string
  default     = "arn:aws:lambda:ap-northeast-1:873528684822:layer:arm-php-84:17"
}

variable "log_retention_days" {
  description = "CloudWatch Logs retention (days)"
  type        = number
  default     = 7
}
